from setuptools import setup, find_packages

setup(
    name="game-core",           # pip install name (hyphens ok)
    version="0.1.0",
    package_dir={"": "src"},     # look inside src/ for packages
    packages=find_packages("src"),  # will find ["game", "game.core"]
)