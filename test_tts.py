import os
import logging
import soundfile as sf
import sounddevice as sd
from tts_manager import TTSManager

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    try:
        logger.info("Starting TTS test...")
        
        # Initialize TTS manager
        tts = TTSManager()
        
        if not tts.is_available():
            logger.error("TTS is not available. Please check the logs for errors.")
            return
        
        # Test text
        test_text = "Hello, this is a test of the Kokoro TTS system. We are testing voice synthesis capabilities."
        output_file = "test_output.wav"
        
        logger.info(f"Generating speech for text: {test_text}")
        logger.info(f"Output will be saved to: {output_file}")
        
        # Generate speech
        tts.generate_speech(test_text, output_file, voice='af_heart')
        
        # Verify the output file
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file)
            logger.info(f"Output file created successfully, size: {file_size} bytes")
            
            # Try to play the audio if sounddevice is available
            try:
                logger.info("Attempting to play the generated audio...")
                data, samplerate = sf.read(output_file)
                sd.play(data, samplerate)
                sd.wait()  # Wait until audio is finished playing
                logger.info("Audio playback completed")
            except Exception as e:
                logger.warning(f"Could not play audio: {str(e)}")
        else:
            logger.error("Output file was not created")
            
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        raise

if __name__ == "__main__":
    main() 