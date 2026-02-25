import csv
import re
import os

def clean_email(email):
    if not email:
        return None
    email = email.strip()
    # Basic email regex
    if re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return email.lower()
    return None

def clean_name(name):
    if not name:
        return "Texas Realtor"
    name = name.strip()
    # Remove some common suffixes/titles if they interfere
    name = re.sub(r",?\s*(Realtor®?|STAR REALTY GROUP|Group|Team).*", "", name, flags=re.IGNORECASE)
    # Handle specific placeholders
    if "Last Name Unknown" in name:
        name = name.split("[")[0].strip()
    if not name:
        return "Texas Realtor"
    return name

def process_leads(input_file, output_file):
    leads = {} # map email -> name
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    with open(input_file, mode='r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        headers = next(reader) # Skip header line
        
        for row in reader:
            # Block 1: Twitter
            if len(row) > 2:
                name = row[0]
                email = clean_email(row[2])
                if email:
                    leads[email] = clean_name(name)
            
            # Block 2: YouTube
            if len(row) > 13:
                name = row[11]
                email = clean_email(row[13])
                if email and email not in leads:
                    leads[email] = clean_name(name)
            
            # Block 3: Facebook
            if len(row) > 22:
                name = row[20]
                email = clean_email(row[22])
                if email and email not in leads:
                    leads[email] = clean_name(name)

    print(f"Extracted {len(leads)} unique contacts.")

    with open(output_file, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Email"])
        for email, name in leads.items():
            writer.writerow([name, email])
    
    print(f"Cleaned leads saved to {output_file}")

if __name__ == "__main__":
    input_path = r"C:\Users\praja\Downloads\x twitter - Sheet1.csv"
    output_path = os.path.join(os.getcwd(), "cleaned_leads.csv")
    process_leads(input_path, output_path)
