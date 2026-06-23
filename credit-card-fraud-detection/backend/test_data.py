import os
import pandas as pd
from sklearn.model_selection import train_test_split

def extract_and_save_test_set(csv_path="../data/creditcard.csv"):
    print(f"⏳ Loading master dataset file from: {csv_path}")
    try:
        # 1. Load the original Kaggle master dataset
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"❌ Error: Could not find the file at '{csv_path}'.")
        print("💡 Tip: Double check if your master file is inside a 'data' folder next to the 'backend' folder.")
        return

    print(f"📊 Dataset successfully loaded. Total rows: {len(df):,}")

    # 🌟 FIXED: Defining X and y explicitly before splitting
    X = df.drop(columns=["Class"])
    y = df["Class"]

    # 2. Perform the exact deterministic split
    print("✂️ Splitting dataset into train and test chunks...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 3. Combine the test features and test labels back into one dataframe
    test_dataset = X_test.copy()
    test_dataset["Class"] = y_test

    # 4. Create the 'data' directory if it's missing inside backend
    os.makedirs("data", exist_ok=True)

    # 5. Export to CSV files
    print("💾 Saving files to disk...")
    
    # Save the full test set (with true answers) for validation
    test_dataset.to_csv("data/creditcard_test_true.csv", index=False)
    
    # Save a version WITHOUT the 'Class' column for the frontend UI drag-and-drop area
    batch_upload_ready = X_test.copy()
    batch_upload_ready.to_csv("data/creditcard_batch_upload_ready.csv", index=False)

    print("\n✅ Extraction complete!")
    print(f"📁 Saved full validation file to: 'backend/data/creditcard_test_true.csv'")
    print(f"📁 Saved frontend-ready batch file to: 'backend/data/creditcard_batch_upload_ready.csv'")

if __name__ == "__main__":
    extract_and_save_test_set()