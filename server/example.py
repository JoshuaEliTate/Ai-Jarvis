from elevenlabs import clone, generate, play, set_api_key
from elevenlabs.api import History

set_api_key("")

voice = clone(
    name="Voice Name",
    description="An old American male voice with a slight hoarseness in his throat. Perfect for news.",
    files=["./audio/welcome.mp3", "./audio/elseAssist.mp3"],
)

audio = generate(text="Some very long text to be read by the voice", voice=voice)

play(audio)

history = History.from_api()
print(history)
