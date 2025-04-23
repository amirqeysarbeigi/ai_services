import os
import sys
import subprocess
import pkg_resources

def install_requirements():
    """Install required packages."""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Successfully installed requirements")
        return True
    except Exception as e:
        print(f"Error installing requirements: {str(e)}")
        return False

def setup_environment():
    """Set up the environment for TTS."""
    print("Setting up environment...")
    try:
        # Create necessary directories
        model_dir = os.path.join(os.getcwd(), 'models', 'tts')
        os.makedirs(model_dir, exist_ok=True)
        print(f"Created model directory at: {model_dir}")
        
        # Set environment variables
        os.environ["COQUI_TTS_MODEL_DIR"] = model_dir
        print("Set environment variables")
        
        return True
    except Exception as e:
        print(f"Error setting up environment: {str(e)}")
        return False

def verify_installation():
    """Verify that required packages are installed correctly."""
    print("Verifying installation...")
    required_packages = [
        "TTS",
        "numpy",
        "torch",
        "flask",
        "flask-cors",
        "opencv-python"
    ]
    
    missing = []
    for package in required_packages:
        try:
            pkg_resources.require(package)
        except pkg_resources.DistributionNotFound:
            missing.append(package)
    
    if missing:
        print(f"Missing packages: {', '.join(missing)}")
        return False
    
    print("All required packages are installed")
    return True

def main():
    """Main setup function."""
    print("Starting setup...")
    
    if not install_requirements():
        print("Failed to install requirements")
        return False
    
    if not setup_environment():
        print("Failed to set up environment")
        return False
    
    if not verify_installation():
        print("Failed to verify installation")
        return False
    
    print("Setup completed successfully")
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("Setup failed")
        sys.exit(1)
    sys.exit(0) 