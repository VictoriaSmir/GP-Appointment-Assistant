from __future__ import annotations

from dataclasses import dataclass

from transformers import AutoTokenizer
from optimum.intel.openvino import OVModelForSeq2SeqLM


@dataclass
class NLLBTranslator:
    tokenizer: any
    model: OVModelForSeq2SeqLM
    device: str = "CPU"

    def translate(
        self,
        text: str,
        src_lang: str,
        tgt_lang: str,
        max_new_tokens: int = 256,
        num_beams: int = 3,
    ) -> str:
        text = (text or "").strip()
        if not text:
            return ""

        self.tokenizer.src_lang = src_lang

        inputs = self.tokenizer(text, return_tensors="pt")

        forced_bos_token_id = self.tokenizer.convert_tokens_to_ids(tgt_lang)
        if forced_bos_token_id is None:
            raise ValueError(f"Unknown tgt_lang code: {tgt_lang}")

        out = self.model.generate(
            **inputs,
            forced_bos_token_id=forced_bos_token_id,
            max_new_tokens=max_new_tokens,
            num_beams=num_beams,
        )

        return self.tokenizer.batch_decode(out, skip_special_tokens=True)[0].strip()


def load_nllb_translator(model_dir: str, device: str = "CPU") -> NLLBTranslator:
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_dir, fix_mistral_regex=True)
    except TypeError:
        tokenizer = AutoTokenizer.from_pretrained(model_dir)

    model = OVModelForSeq2SeqLM.from_pretrained(model_dir, device=device)
    return NLLBTranslator(tokenizer=tokenizer, model=model, device=device)
