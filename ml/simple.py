import tensorflow as tf
from tensorflow import keras
keras = tf.keras
from keras.applications import ResNet50
from keras.applications.resnet50 import preprocess_input  
from keras.preprocessing import image  
from sklearn.metrics.pairwise import cosine_similarity 
import matplotlib.pyplot as plt  
import cv2
import numpy as np
import matplotlib.pyplot as plt
from transformers import BertTokenizer, BertModel
import torch

# Load ResNet50 model
model = ResNet50(weights='imagenet')
model = ResNet50(weights='imagenet', include_top=False, pooling='avg')

print("ResNet50 model loaded successfully!")
print(f"Model output shape: {model.output_shape}")

img_path = img1_path = sender_img = "ml/sender_cup.jpg"
img2_path = receiver_img = "ml/download.jpg"
def extract_features(img_path):

    img = image.load_img(img_path, target_size=(224, 224))
    
    # Convert to array and add batch dimension
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    
    features = model.predict(img_array, verbose=0) 
    return features.flatten()  # Shape: (2048,)

def extract_text_features(text_description):
    """
    Extracts a feature vector from a text description using BERT.
    
    Args:
        text_description (str): Text description (e.g., "a red cup on a table").
    
    Returns:
        np.array: Feature vector from the [CLS] token (768-dim).
    """
    inputs = tokenizer(text_description, return_tensors="pt", padding=True, truncation=True, max_length=128)
    with torch.no_grad():
        outputs = model_bert(**inputs)
        text_features = outputs.last_hidden_state[:, 0, :].numpy()
    return text_features.flatten()
print("Feature extraction function ready.")

def compare_images(img1_path, img2_path, threshold=0.95):

    features1 = extract_features(img1_path)  
    features2 = extract_features(img2_path)  
    
    similarity = cosine_similarity([features1], [features2])[0][0]
    
    is_match = similarity >= threshold
    
    return {
        'similarity': similarity,
        'is_match': is_match,
        'features1': features1,
        'features2': features2
    }


result = compare_images(sender_img, receiver_img, threshold=0.95)

print(f"Similarity score: {result['similarity']:.4f}")
print(f"Is a match? {result['is_match']}")

# Optional: Visualize the images side-by-side
if 'matplotlib' in globals():
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    img1 = image.load_img(sender_img)
    img2 = image.load_img(receiver_img)
    axes[0].imshow(img1)
    axes[0].set_title('Sender Image')
    axes[1].imshow(img2)
    axes[1].set_title('Receiver Image')
    plt.suptitle(f'Similarity: {result["similarity"]:.4f}')
    plt.show()


# In your bounty validation logic
def validate_submission(new_img_path, existing_features_db):
    new_features = extract_features(new_img_path)
    similarities = [cosine_similarity([new_features], [feat])[0][0] for feat in existing_features_db]
    if max(similarities) > 0.95:
        return False, "Duplicate detected"
    return True, "Valid"



