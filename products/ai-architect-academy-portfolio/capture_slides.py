#!/usr/bin/env python3
"""
Capture all slides from a Google Slides presentation and save as PNG files.
"""
import asyncio
import sys
from pathlib import Path
from playwright.async_api import async_playwright

async def capture_slides(slides_url: str, output_dir: str, slide_count: int):
    """Capture all slides from Google Slides presentation."""

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            ignore_https_errors=True
        )
        page = await context.new_page()

        print(f"Opening presentation: {slides_url}")
        await page.goto(slides_url, wait_until="networkidle")

        # Wait for presentation to load
        await page.wait_for_timeout(3000)

        captured_files = []

        for slide_num in range(1, slide_count + 1):
            try:
                # Wait for slide to be visible
                await page.wait_for_timeout(1500)

                # Take screenshot
                screenshot_name = f"s{slide_num:02d}.png"
                screenshot_path = output_path / screenshot_name

                # Scroll or navigate to ensure current slide is visible
                await page.keyboard.press("End")  # Jump to bottom to ensure render
                await page.wait_for_timeout(500)

                # Capture the viewport
                await page.screenshot(path=str(screenshot_path), full_page=False)

                captured_files.append(str(screenshot_path))
                print(f"✓ Captured slide {slide_num:2d}/{slide_count}: {screenshot_name}")

                # Navigate to next slide
                if slide_num < slide_count:
                    await page.keyboard.press("ArrowRight")
                    await page.wait_for_timeout(1000)

            except Exception as e:
                print(f"✗ Error capturing slide {slide_num}: {e}")
                continue

        await browser.close()

        print(f"\n✓ Captured {len(captured_files)} slides")
        print(f"Saved to: {output_path}")
        return captured_files

async def main():
    slides_url = "https://docs.google.com/presentation/d/1uUlurwTyUQrs5aRXkP8nUdnR1r6t_GDUhu5N6Vyb1hw/edit"
    output_dir = "output/screenshots"
    slide_count = 27

    captured = await capture_slides(slides_url, output_dir, slide_count)

    print(f"\nCaptured {len(captured)} slides:")
    for f in captured:
        print(f"  - {f}")

if __name__ == "__main__":
    asyncio.run(main())
