import os

# Array of file paths
files = [
    'room.js',
    'index.js',
    'lobby.js'
]

# String to remove
string_to_remove = 'export {};\n'

for file_path in files:
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove the string if it appears at the end
        if content.endswith(string_to_remove):
            content = content[:-len(string_to_remove)]
            
            # Write the updated content back to the file
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            
            print(f"Updated file: {file_path}")
        else:
            print(f"No change needed for file: {file_path}")
    
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")
