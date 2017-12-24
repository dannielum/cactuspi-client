import sys
from PIL import Image, ImageFont, ImageDraw

def colorRed():
    return (255, 0, 0)

def writeImage(inputString, filename, ledRows):
    font = ImageFont.truetype("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc", 28)
    width, ignore = font.getsize(inputString)
    im = Image.new("RGB", (width + 30, ledRows), "black")
    draw = ImageDraw.Draw(im)
    draw.text((0, 0), inputString, colorRed(), font=font)

    im.save(filename)

if __name__ == '__main__':
    writeImage(sys.argv[1], sys.argv[2], 32)
