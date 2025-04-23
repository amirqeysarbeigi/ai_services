import os
import logging
from pathlib import Path
from TTS.api import TTS
from TTS.utils.manage import ModelManager

# Set up logging with more detail
logging.basicConfig(
    level=logging.DEBUG,  # Change to DEBUG for more detailed logs
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_model_directory():
    """Set up the model directory with proper permissions."""
    try:
        # Use user's Documents folder
        home_dir = os.path.expanduser('~')
        docs_dir = os.path.join(home_dir, 'Documents')
        model_dir = os.path.join(docs_dir, 'IKIU_TTS_Models')
        
        logger.debug(f"Attempting to create model directory at: {model_dir}")
        
        # Create the directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
        
        # Test write permissions
        test_file = os.path.join(model_dir, '.test')
        logger.debug(f"Testing write permissions with file: {test_file}")
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        
        # Set environment variables
        os.environ["COQUI_TTS_MODEL_DIR"] = model_dir
        os.environ["COQUI_TTS_HOME"] = model_dir
        
        logger.info(f"Model directory set up successfully at: {model_dir}")
        return model_dir
    except Exception as e:
        logger.error(f"Failed to set up model directory: {str(e)}")
        logger.error(f"Home directory: {os.path.expanduser('~')}")
        return None

def download_model(model_dir):
    """Download the TTS model."""
    try:
        logger.info("Starting model download...")
        manager = ModelManager(model_dir)
        
        # Try primary model first
        try:
            logger.info("Attempting to download primary model (fast_pitch)...")
            logger.debug("Model path: tts_models/en/ljspeech/fast_pitch")
            manager.download_model("tts_models/en/ljspeech/fast_pitch", progress_bar=True)
            logger.info("Primary model downloaded successfully")
            return "tts_models/en/ljspeech/fast_pitch"
        except Exception as e:
            logger.warning(f"Failed to download primary model: {str(e)}")
            logger.debug("Stack trace for primary model download failure:", exc_info=True)
            
            # Try fallback model
            try:
                logger.info("Attempting to download fallback model (tacotron2-DDC)...")
                logger.debug("Model path: tts_models/en/ljspeech/tacotron2-DDC")
                manager.download_model("tts_models/en/ljspeech/tacotron2-DDC", progress_bar=True)
                logger.info("Fallback model downloaded successfully")
                return "tts_models/en/ljspeech/tacotron2-DDC"
            except Exception as e2:
                logger.error(f"Failed to download fallback model: {str(e2)}")
                logger.debug("Stack trace for fallback model download failure:", exc_info=True)
                return None
                
    except Exception as e:
        logger.error(f"Failed to download model: {str(e)}")
        logger.debug("Stack trace for model download failure:", exc_info=True)
        return None

def verify_model(model_name, model_dir):
    """Verify that the downloaded model works correctly."""
    try:
        logger.info(f"Verifying model: {model_name}")
        logger.debug(f"Initializing TTS with model: {model_name}")
        tts = TTS(model_name=model_name, progress_bar=True, gpu=False)
        
        # Test the model
        test_file = os.path.join(model_dir, "test.wav")
        logger.debug(f"Testing model with output file: {test_file}")
        tts.tts_to_file(text="Test", file_path=test_file)
        
        if os.path.exists(test_file):
            os.remove(test_file)
            logger.info("Model verification successful")
            return True
        else:
            logger.error("Model verification failed - test file not created")
            return False
            
    except Exception as e:
        logger.error(f"Model verification failed: {str(e)}")
        logger.debug("Stack trace for model verification failure:", exc_info=True)
        return False

def main():
    """Main function to initialize the TTS model."""
    logger.info("Starting TTS model initialization...")
    
    # Set up model directory
    model_dir = setup_model_directory()
    if not model_dir:
        logger.error("Failed to set up model directory")
        return False
    
    # Download model
    model_name = download_model(model_dir)
    if not model_name:
        logger.error("Failed to download model")
        return False
    
    # Verify model
    if not verify_model(model_name, model_dir):
        logger.error("Failed to verify model")
        return False
    
    logger.info("TTS model initialization completed successfully")
    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            logger.error("TTS model initialization failed")
            exit(1)
    except Exception as e:
        logger.error(f"Unexpected error during initialization: {str(e)}")
        logger.debug("Stack trace for initialization failure:", exc_info=True)
        exit(1) 