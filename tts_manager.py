import os
import logging
import soundfile as sf
import torch
import numpy as np
from kokoro import KPipeline
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TTSManager:
    def __init__(self):
        self.pipeline = None
        self.initialize()
    
    def initialize(self):
        """Initialize the TTS manager with Kokoro model."""
        try:
            logger.info("Initializing TTS manager with Kokoro...")
            
            # Initialize the pipeline with explicit model path
            model_path = os.path.join(os.path.expanduser("~"), ".cache", "huggingface", "hub", "models--hexgrad--Kokoro-82M")
            logger.info(f"Using model path: {model_path}")
            
            self.pipeline = KPipeline(
                lang_code='a',
                repo_id='hexgrad/Kokoro-82M'
            )
            logger.info("Successfully initialized Kokoro TTS pipeline")
            
            # Test the pipeline
            self._verify_model()
            
        except Exception as e:
            logger.error(f"Failed to initialize TTS manager: {str(e)}")
            self.pipeline = None
    
    def _process_audio_chunk(self, audio_chunk):
        """Process an audio chunk and convert it to numpy array."""
        try:
            if isinstance(audio_chunk, torch.Tensor):
                return audio_chunk.detach().cpu().numpy()
            elif isinstance(audio_chunk, (np.ndarray, list)):
                return np.array(audio_chunk)
            else:
                logger.warning(f"Unexpected audio chunk type: {type(audio_chunk)}")
                return None
        except Exception as e:
            logger.error(f"Error processing audio chunk: {str(e)}")
            return None

    def _verify_model(self):
        """Verify that the TTS model is working correctly."""
        try:
            # Create a temporary test file
            test_text = "Testing Kokoro TTS model initialization."
            test_file = "test_verification.wav"
            
            logger.info("Starting model verification...")
            logger.info(f"Generating test audio for text: {test_text}")
            
            # Generate test audio
            generator = self.pipeline(test_text, voice='af_heart')
            audio_chunks = []
            
            # Collect all audio chunks
            for i, (gs, ps, audio_chunk) in enumerate(generator):
                logger.debug(f"Processing chunk {i}: gs={gs}, ps={ps}")
                processed_chunk = self._process_audio_chunk(audio_chunk)
                if processed_chunk is not None:
                    audio_chunks.append(processed_chunk)
                    logger.debug(f"Added audio chunk of shape {processed_chunk.shape}")
            
            if audio_chunks:
                logger.info(f"Collected {len(audio_chunks)} audio chunks")
                # Concatenate chunks and save
                full_audio = np.concatenate(audio_chunks)
                logger.info(f"Concatenated audio shape: {full_audio.shape}")
                
                sf.write(test_file, full_audio, 24000)
                logger.info(f"Saved test audio to {test_file}")
                
                if os.path.exists(test_file):
                    file_size = os.path.getsize(test_file)
                    logger.info(f"Test file created successfully, size: {file_size} bytes")
                    os.remove(test_file)  # Clean up test file
                else:
                    logger.error("Test file was not created")
                    self.pipeline = None
            else:
                logger.error("No audio chunks were generated")
                self.pipeline = None
                    
        except Exception as e:
            logger.error(f"TTS model verification failed: {str(e)}")
            self.pipeline = None
    
    def is_available(self):
        """Check if TTS is available and working."""
        return self.pipeline is not None
    
    def generate_speech(self, text, output_path, voice='af_heart'):
        """Generate speech from text and save to file."""
        if not self.is_available():
            raise Exception("TTS model is not available")
        
        try:
            logger.info(f"Generating speech for text: {text[:50]}...")
            logger.info(f"Using voice: {voice}")
            
            # Generate audio using the pipeline
            generator = self.pipeline(text, voice=voice)
            audio_chunks = []
            
            # Collect all audio chunks
            for i, (gs, ps, audio_chunk) in enumerate(generator):
                logger.debug(f"Processing chunk {i}: gs={gs}, ps={ps}")
                processed_chunk = self._process_audio_chunk(audio_chunk)
                if processed_chunk is not None:
                    audio_chunks.append(processed_chunk)
                    logger.debug(f"Added audio chunk of shape {processed_chunk.shape}")
            
            if not audio_chunks:
                raise Exception("TTS generation produced no audio chunks")
            
            logger.info(f"Collected {len(audio_chunks)} audio chunks")
            
            # Concatenate chunks and save
            full_audio = np.concatenate(audio_chunks)
            logger.info(f"Concatenated audio shape: {full_audio.shape}")
            
            sf.write(output_path, full_audio, 24000)
            logger.info(f"Successfully generated speech and saved to: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate speech: {str(e)}")
            raise 