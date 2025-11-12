#!/usr/bin/env python3
"""
Script for å generere app-ikoner fra et kildebilde
Krever: pip install Pillow
"""

from PIL import Image
import os
import sys

# Størrelser som trengs for PWA
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def generate_icons(source_path, output_dir='assets/icons'):
    """
    Generer alle ikoner fra et kildebilde
    
    Args:
        source_path: Sti til kildebildet
        output_dir: Mappe hvor ikonene skal lagres
    """
    # Sjekk om kildebildet eksisterer
    if not os.path.exists(source_path):
        print(f"❌ Feil: Finner ikke bilde: {source_path}")
        return False
    
    # Opprett output-mappe hvis den ikke eksisterer
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # Last inn kildebildet
        print(f"📷 Laster bilde: {source_path}")
        source_img = Image.open(source_path)
        
        # Konverter til RGBA hvis nødvendig
        if source_img.mode != 'RGBA':
            source_img = source_img.convert('RGBA')
        
        print(f"✅ Bilde lastet: {source_img.width}x{source_img.height} px")
        print(f"📁 Lagrer ikoner til: {output_dir}\n")
        
        # Generer hver størrelse
        for size in SIZES:
            # Opprett nytt bilde med hvit bakgrunn
            icon = Image.new('RGBA', (size, size), (255, 255, 255, 255))
            
            # Beregn skalering for å beholde aspect ratio
            scale = min(size / source_img.width, size / source_img.height)
            new_width = int(source_img.width * scale)
            new_height = int(source_img.height * scale)
            
            # Sentrer bildet
            x = (size - new_width) // 2
            y = (size - new_height) // 2
            
            # Resize og paste
            resized = source_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            icon.paste(resized, (x, y), resized if source_img.mode == 'RGBA' else None)
            
            # Lagre som PNG
            output_path = os.path.join(output_dir, f'icon-{size}x{size}.png')
            icon.save(output_path, 'PNG', optimize=True)
            print(f"✅ Generert: icon-{size}x{size}.png")
        
        print(f"\n🎉 Alle {len(SIZES)} ikoner generert!")
        return True
        
    except Exception as e:
        print(f"❌ Feil ved generering: {e}")
        return False

if __name__ == '__main__':
    # Standard kildebilde
    default_source = 'assets/images/b2school.png'
    
    # Hent kildebilde fra kommandolinjen eller bruk standard
    if len(sys.argv) > 1:
        source_image = sys.argv[1]
    else:
        source_image = default_source
    
    # Kjør generering
    success = generate_icons(source_image)
    
    if success:
        print("\n📋 Neste steg:")
        print("1. Verifiser at alle ikoner er i assets/icons/")
        print("2. Test PWA-installasjonen i nettleseren")
        sys.exit(0)
    else:
        print("\n💡 Tips:")
        print("- Sjekk at kildebildet eksisterer")
        print("- Installer Pillow: pip install Pillow")
        sys.exit(1)

