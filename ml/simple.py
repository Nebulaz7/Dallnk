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


model = ResNet50(weights='imagenet')
model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model_bert = BertModel.from_pretrained('bert-base-uncased')
print("ResNet50 model loaded successfully!")
print(f"Model output shape: {model.output_shape}")

text_description = sender_text = "10,000 labeled images of cups" 
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

    inputs = tokenizer(text_description, return_tensors="pt", padding=True, truncation=True, max_length=128)
    with torch.no_grad():
        outputs = model_bert(**inputs)
        text_features = outputs.last_hidden_state[:, 0, :].numpy()
    return text_features.flatten()
print("Feature extraction function ready.")

def compare_images(img1_path, img2_path, threshold=0.5):

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

result = compare_images(sender_img, receiver_img, threshold=0.5)
def compare_text_image(text_description, img_path, text_weight=0.5, img_weight=0.5, threshold=0.5):
    
    text_features = extract_text_features(text_description)
    img_features = extract_features(img_path)
    # 
    text_features = text_features / np.linalg.norm(text_features)
    img_features = img_features / np.linalg.norm(img_features)
    
    similarity = cosine_similarity([text_features], [img_features])[0][0]
    

    combined_similarity = similarity * text_weight + similarity * img_weight
    combined_similarity = min(combined_similarity, 1.0)
    is_match = combined_similarity >= threshold
    
    return {
        'combined_similarity': combined_similarity,
        'is_match': is_match
    }


result = compare_text_image(sender_text, receiver_img_path)
if result['is_match']:
    print("Image matches description, proceeding with validation.")
else:
    print("Mismatch detected, flagging for review.")

print(f"Similarity score: {result['similarity']:.4f}")
print(f"Is a match? {result['is_match']}")
