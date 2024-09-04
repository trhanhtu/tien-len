import re

def generate_ts_function_docs(ts_file_path):
    with open(ts_file_path, 'r', encoding='utf-8') as file:
        ts_code = file.read()

    # Regex pattern to match TypeScript functions
    function_pattern = re.compile(
        r'function\s+(\w+)\s*\((.*?)\)\s*:\s*(\w+)|function\s+(\w+)\s*\((.*?)\)\s*{',
        re.DOTALL
    )
    
    # Find all functions in the file
    functions = function_pattern.findall(ts_code)
    
    # Generate documentation
    docs = []
    for func in functions:
        func_name = func[0] or func[3]
        params = func[1] or func[4]
        return_type = func[2] if func[2] else 'void'
        
        # Clean up parameters
        param_list = []
        for param in params.split(','):
            param_name_type = param.split(':')
            if len(param_name_type) == 2:
                param_list.append(f"{param_name_type[0].strip()} ({param_name_type[1].strip()})")
            else:
                param_list.append(param.strip())

        param_docs = "\n    ".join(param_list) if param_list else "None"
        
        doc = f"""
Function: {func_name}
Parameters:
    {param_docs}
Returns:
    {return_type}
"""
        docs.append(doc)
    
    return "\n".join(docs)

# Usage
ts_file_path = 'main.ts'
docs = generate_ts_function_docs(ts_file_path)
print(docs)
