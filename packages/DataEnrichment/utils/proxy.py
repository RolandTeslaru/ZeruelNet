# All public proxies are banned

# import requests
# import logging
# import random
# import concurrent.futures
# import os

# CUSTOM_PROXIES = """
#     https://101.251.204.174:8080
#     https://23.237.210.82:80
#     https://152.42.170.187:9090
#     https://128.199.254.13:9090
#     https://164.163.42.25:10000
#     https://128.199.120.45:9090
#     https://146.190.80.158:9090
#     https://128.199.253.195:9090
#     https://200.174.198.86:8888
#     socks5://65.108.159.129:1080
# """.strip().splitlines()

# CHECK_URL   = "https://www.tiktok.com/"          # target to test
# TIMEOUT_SEC = 5
# KEEP_FIRST  = int(os.getenv("PROXY_POOL_SIZE", 10))  

# def _is_alive(proxy: str) -> bool:
#     try:
#         requests.head(
#             CHECK_URL,
#             proxies={"http": proxy, "https": proxy},
#             timeout=TIMEOUT_SEC,
#             allow_redirects=False,
#         )
#         return True
#     except Exception:
#         return False

# def get_working_proxies(limit: int = KEEP_FIRST) -> list[str]:
#     candidates = [p.strip() for p in CUSTOM_PROXIES if p.strip()]
#     random.shuffle(candidates) # try a different order each run
#     good: list[str] = []

#     with concurrent.futures.ThreadPoolExecutor(max_workers=32) as pool:
#         for proxy, ok in zip(candidates, pool.map(_is_alive, candidates), strict=False):
#             if ok:
#                 good.append(proxy)
#                 logging.info("✓  Proxy OK  %s", proxy)
#                 if len(good) >= limit:
#                     break

#     logging.info("Proxy tester: %d / %d proxies passed", len(good), len(candidates))
#     return good