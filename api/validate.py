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
import json
from http import HTTPStatus


model = ResNet50(weights='imagenet')
model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model_bert = BertModel.from_pretrained('bert-base-uncased')
print("ResNet50 model loaded successfully!")
print(f"Model output shape: {model.output_shape}")


def extract_image_features(img_path):
    """Extract 2048-dim feature vector from an image using ResNet50."""
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    features = model_resnet.predict(img_array, verbose=0)
    return features.flatten() / np.linalg.norm(features)  # Normalize

def extract_text_features(text_description):
    """Extract 768-dim feature vector from text using BERT."""
    inputs = tokenizer(text_description, return_tensors="pt", padding=True, truncation=True, max_length=128)
    with torch.no_grad():
        outputs = model_bert(**inputs)
        text_features = outputs.last_hidden_state[:, 0, :].numpy()
    return text_features.flatten() / np.linalg.norm(text_features)  # Normalize

def handler(event, context):
    try:
        # Parse incoming JSON
        body = json.loads(event['body'])
        sender_text = body.get('sender_text', "").strip()
        sender_img_path = body.get('sender_img_path', "")
        receiver_img_path = body.get('receiver_img_path', "")

        if not receiver_img_path:
            return {
                "statusCode": HTTPStatus.BAD_REQUEST,
                "body": json.dumps({"error": "Receiver image path required"})
            }

        # Fallback logic
        if sender_text:
            # Text-to-image comparison
            text_features = extract_text_features(sender_text)
            img_features = extract_image_features(receiver_img_path)
            combined_features = np.concatenate([text_features, img_features])  # Combine for similarity
        elif sender_img_path:
            # Image-to-image comparison (fallback)
            sender_features = extract_image_features(sender_img_path)
            receiver_features = extract_image_features(receiver_img_path)
            combined_features = np.concatenate([sender_features, receiver_features])
        else:
            return {
                "statusCode": HTTPStatus.BAD_REQUEST,
                "body": json.dumps({"error": "Sender must provide text or image"})
            }

        similarity = cosine_similarity([combined_features[:768]], [combined_features[768:]])[0][0]  # Align dims
        is_match = similarity >= 0.5  # 50% cutoff

        return {
            "statusCode": HTTPStatus.OK,
            "body": json.dumps({"match": is_match, "similarity": similarity})
        }

    except Exception as e:
        return {
            "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
            "body": json.dumps({"error": str(e)})
        }

if __name__ == "__main__":
    # Local test
    event = {"body": json.dumps({"sender_text": "", "sender_img_path": "path/to/sender.jpg", "receiver_img_path": "path/to/receiver.jpg"})}
    result = handler(event, None)
    print(json.loads(result["body"]))


