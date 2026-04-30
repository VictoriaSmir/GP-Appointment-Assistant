let mediaRecorder    = null;
let chunks           = [];
let streamRef        = null;
let currentUserDraft = null;

let selectedLanguage  = "eng_Latn";
let detectedLanguage  = null;
let appointmentType   = null;
let translatedStrings = null;
let currentScreen     = "voiceDetectionScreen";

let ttsEnabled = false;
let ttsAudio   = null;

let inputMode = "voice";