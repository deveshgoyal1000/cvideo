import hashlib
import json

class CaptionCache:
    """
    Very basic in-memory cache simulator.
    In production, this would use Redis and hash the Project dict to skip stages.
    """
    def __init__(self):
        self.cache = {}
        
    def generate_hash(self, project_data: dict) -> str:
        data_str = json.dumps(project_data, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()
        
    def get(self, hash_key: str):
        return self.cache.get(hash_key)
        
    def set(self, hash_key: str, data: dict):
        self.cache[hash_key] = data

cache_layer = CaptionCache()
