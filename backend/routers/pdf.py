from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PDFRequest(BaseModel):
    answers_original: dict[str, str]
    answers_english:  dict[str, str]
    question_labels:  dict[str, str]
    patient_language: str
    service_title:    str = "General appointment"

@router.post("/generate_pdf")
async def generate_pdf(request: PDFRequest):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.colors import HexColor, white, black
        from reportlab.lib.units import mm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table,
            TableStyle, HRFlowable, KeepTogether
        )
        from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
        from reportlab.pdfgen import canvas as pdfcanvas
    except ImportError:
        return {"error": "reportlab not installed. Run: pip install reportlab"}

    PURPLE      = HexColor("#4F46E5")
    PURPLE_DARK = HexColor("#3730A3")
    PURPLE_LIGHT= HexColor("#EEF2FF")
    PURPLE_MID  = HexColor("#818CF8")
    SLATE_900   = HexColor("#0F172A")
    SLATE_700   = HexColor("#334155")
    SLATE_500   = HexColor("#64748B")
    SLATE_300   = HexColor("#CBD5E1")
    SLATE_100   = HexColor("#F1F5F9")
    SLATE_50    = HexColor("#F8FAFC")
    AMBER_BG    = HexColor("#FFFBEB")
    AMBER_BDR   = HexColor("#FCD34D")
    AMBER_TEXT  = HexColor("#92400E")
    GREEN       = HexColor("#065F46")
    GREEN_BG    = HexColor("#ECFDF5")

    PAGE_W, PAGE_H = A4
    MARGIN = 20 * mm
    W = PAGE_W - 2 * MARGIN

    def s(name, **kw):
        base = ParagraphStyle(
            name,
            fontName="Helvetica",
            fontSize=10,
            textColor=SLATE_700,
            leading=15,
        )
        for k, v in kw.items():
            setattr(base, k, v)
        return base

    hero_title_s = s("HT", fontName="Helvetica-Bold", fontSize=22,
                      textColor=white, alignment=TA_LEFT, leading=28)
    hero_sub_s   = s("HS", fontSize=11, textColor=HexColor("#C7D2FE"),
                      alignment=TA_LEFT, leading=16)
    hero_date_s  = s("HD", fontSize=8, textColor=HexColor("#A5B4FC"),
                      alignment=TA_RIGHT, leading=11)

    svc_label_s  = s("SL", fontSize=8, textColor=PURPLE_MID,
                      fontName="Helvetica-Bold", leading=11, spaceAfter=1)
    svc_val_s    = s("SV", fontName="Helvetica-Bold", fontSize=13,
                      textColor=white, leading=17)

    section_s    = s("SEC", fontName="Helvetica-Bold", fontSize=8,
                      textColor=PURPLE, leading=12,
                      spaceBefore=2, spaceAfter=2)

    q_label_s    = s("QL", fontName="Helvetica-Bold", fontSize=8,
                      textColor=SLATE_500, leading=11, spaceAfter=3)
    a_s          = s("A",  fontName="Helvetica", fontSize=11,
                      textColor=SLATE_900, leading=16, spaceAfter=1)

    note_s       = s("N",  fontSize=8, textColor=AMBER_TEXT,
                      leading=12, alignment=TA_LEFT)
    footer_s     = s("F",  fontSize=8, textColor=SLATE_500,
                      alignment=TA_CENTER, leading=11)

    def hr(color=SLATE_300, thickness=0.5, space_before=0, space_after=4):
        return HRFlowable(
            width="100%", thickness=thickness,
            color=color, spaceBefore=space_before, spaceAfter=space_after
        )

    def spacer(h_mm=4):
        return Spacer(1, h_mm * mm)

    buf = BytesIO()

    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        rightMargin=MARGIN, leftMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
    )

    generated   = datetime.now().strftime("%d %B %Y")
    generated_t = datetime.now().strftime("%H:%M")

    story = []

    left_col = [
        Paragraph("GP Appointment", hero_title_s),
        Paragraph("Assistant", hero_title_s),
        spacer(2),
        Paragraph("Patient Appointment Request", hero_sub_s),
    ]
    right_col = [
        Paragraph(generated, hero_date_s),
        Paragraph(generated_t, hero_date_s),
    ]

    hero = Table(
        [[left_col, right_col]],
        colWidths=[W * 0.65, W * 0.35],
    )
    hero.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), PURPLE),
        ("TOPPADDING",    (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
        ("LEFTPADDING",   (0, 0), (0, -1),  20),
        ("RIGHTPADDING",  (1, 0), (1, -1),  20),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN",         (1, 0), (1, -1),  "RIGHT"),
        ("ROWBACKGROUNDS",(0, 0), (-1, -1), [PURPLE]),
        ("ROUNDEDCORNERS",(0, 0), (-1, -1), [6]),
    ]))
    story.append(hero)
    story.append(spacer(4))

    svc_inner = Table(
        [[
            Paragraph("APPOINTMENT TYPE", svc_label_s),
            Paragraph("", s("empty")),
        ],
        [
            Paragraph(request.service_title, svc_val_s),
            Paragraph("", s("empty")),
        ]],
        colWidths=[W * 0.7, W * 0.3],
    )
    svc_inner.setStyle(TableStyle([
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
    ]))

    svc_outer = Table([[svc_inner]], colWidths=[W])
    svc_outer.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), PURPLE_DARK),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 20),
        ("ROUNDEDCORNERS",(0, 0), (-1, -1), [5]),
    ]))
    story.append(svc_outer)
    story.append(spacer(6))

    story.append(Paragraph("PATIENT RESPONSES", section_s))
    story.append(hr(color=PURPLE, thickness=1.5, space_after=8))

    from backend.constants import LANGUAGE_NAMES
    lang_name = LANGUAGE_NAMES.get(request.patient_language, request.patient_language)

    skip = {"_service_title", "service_type"}
    items = [
        (k, v) for k, v in request.answers_english.items()
        if k not in skip and v and v.strip()
    ]

    for idx, (key, english) in enumerate(items):
        label    = request.question_labels.get(key, key.replace("_", " ").title())
        bg       = SLATE_50 if idx % 2 == 0 else white

        answer_block = [
            Paragraph(label.upper(), q_label_s),
            Paragraph(english, a_s),
        ]

        row_tbl = Table([[answer_block]], colWidths=[W])
        row_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), bg),
            ("TOPPADDING",    (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING",   (0, 0), (-1, -1), 14),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
            ("LINEBELOW",     (0, 0), (-1, -1), 0.5, SLATE_300),
        ]))
        story.append(KeepTogether([row_tbl]))

    story.append(spacer(8))

    staff_note = Table([[
        Paragraph(
            f"For clinical staff: Answers above have been translated from {lang_name} into English "
            f"by an AI translation system (NLLB-200). "
            f"Please contact the patient directly to clarify any responses if needed.",
            note_s,
        )
    ]], colWidths=[W])
    staff_note.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMBER_BG),
        ("BOX",           (0, 0), (-1, -1), 1, AMBER_BDR),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("ROUNDEDCORNERS",(0, 0), (-1, -1), [4]),
    ]))
    story.append(staff_note)
    story.append(spacer(4))

    story.append(hr(color=SLATE_300, thickness=0.5, space_before=4, space_after=4))
    story.append(Paragraph(
        f"Generated {generated} at {generated_t}  ·  GP Appointment Assistant  ·  For clinical use only",
        footer_s,
    ))

    doc.build(story)
    buf.seek(0)

    filename = f"gp_appointment_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/save_pdf")
async def save_pdf(request: PDFRequest):
    import os
    response = await generate_pdf(request)
    content = b""
    async for chunk in response.body_iterator:
        content += chunk
    desktop  = os.path.join(os.path.expanduser("~"), "Desktop")
    filename = f"gp_appointment_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    filepath = os.path.join(desktop, filename)
    with open(filepath, "wb") as f:
        f.write(content)
    os.startfile(filepath)
    return {"status": "ok", "filename": filename}