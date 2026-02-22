const fs = require('fs');
const puppeteer = require('puppeteer');

async function generatePDF() {
    console.log("Reading Markdown...");
    const { marked } = await import('marked');
    let md = fs.readFileSync('The_Quanta_Programming_Language.md', 'utf-8');

    // Wrap the Title section
    const titleRegex = /(# The Quanta Programming Language[\s\S]*?)(?=# Full Table of Contents)/;
    md = md.replace(titleRegex, '<div class="title-page">\n$1\n</div>\n<div class="page-break"></div>\n');

    // Wrap the Table of Contents
    const tocRegex = /(# Full Table of Contents\n+)([\s\S]*?)(?=# Chapter 1: Introduction to Quanta)/;
    md = md.replace(tocRegex, '<div class="toc-container">\n$1<div class="toc-columns">\n$2\n</div>\n</div>\n<div class="page-break"></div>\n');

    // Add explicit page breaks before every chapter (except chapter 1, since TOC has one)
    md = md.replace(/\n(# Chapter \d+:[^\n]+)/g, '\n<div class="page-break"></div>\n$1');

    console.log("Converting to HTML...");
    // Convert to HTML
    const rawHtml = marked.parse(md);

    // CSS styling
    const css = `
        @page {
            size: A4;
            margin: 20mm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #222;
            max-width: 100%;
            margin: 0;
            padding: 0;
            font-size: 11pt;
        }
        .title-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            min-height: 85vh;
            padding-top: 15vh;
        }
        .title-page h1 {
            font-size: 3.5em;
            margin-bottom: 0.2em;
            border-bottom: 3px solid #222;
            padding-bottom: 0.2em;
        }
        .title-page h2 {
            font-weight: 300;
            color: #555;
            margin-bottom: 2em;
        }
        h1, h2, h3, h4 {
            color: #111;
            font-weight: bold;
            page-break-after: avoid;
            page-break-inside: avoid;
        }
        h1 {
            font-size: 2.2em;
            border-bottom: 1px solid #ddd;
            padding-bottom: 0.3em;
            margin-top: 1.5em;
        }
        h2 {
            font-size: 1.6em;
            margin-top: 1.8em;
            color: #333;
        }
        h3 {
            font-size: 1.3em;
            margin-top: 1.2em;
        }
        p {
            margin-bottom: 1em;
            page-break-inside: avoid;
        }
        .toc-container {
            font-size: 8.5pt;
            line-height: 1.3;
        }
        .toc-container h1 {
            text-align: center;
            border-bottom: 0;
            margin-bottom: 2em;
        }
        .toc-container ul {
            list-style-type: none;
            padding-left: 0;
            margin-top: 0.5em;
        }
        .toc-container li {
            margin-bottom: 0.4em;
        }
        .toc-container h2 {
            margin-top: 1.2em;
            font-size: 10.5pt;
            border-bottom: 1px solid #eee;
            padding-bottom: 3px;
        }
        .toc-columns {
            column-count: 2;
            column-gap: 40px;
        }
        .page-break {
            page-break-before: always;
            box-sizing: border-box;
            display: block;
        }
        pre {
            background: #f8f8f8;
            border: 1px solid #eaeaea;
            border-left: 4px solid #666;
            color: #333;
            font-family: 'Courier New', Courier, monospace;
            font-size: 9.5pt;
            line-height: 1.4;
            margin: 1.5em 0;
            padding: 1em;
            display: block;
            word-wrap: break-word;
            white-space: pre-wrap;
            page-break-inside: avoid;
            border-radius: 4px;
        }
        code {
            background: #f4f4f4;
            padding: 2px 4px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 10pt;
            border-radius: 3px;
        }
        pre code {
            background: transparent;
            padding: 0;
            font-size: 9.5pt;
        }
        blockquote {
            border-left: 4px solid #aaa;
            background: #fcfcfc;
            padding: 10px 20px;
            margin: 1.5em 0;
            color: #555;
            font-style: italic;
            page-break-inside: avoid;
        }
        hr {
            border: 0;
            border-top: 1px solid #ddd;
            margin: 2em 0;
        }
    `;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>The Quanta Programming Language</title>
        <style>
            ${css}
        </style>
    </head>
    <body>
        ${rawHtml}
    </body>
    </html>
    `;

    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    console.log("Setting content...");
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    console.log("Generating PDF...");
    await page.pdf({
        path: 'The_Quanta_Programming_Language.pdf',
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 8px; font-family: Helvetica; width: 100%; text-align: center; color: #888;">The Quanta Programming Language</div>',
        footerTemplate: '<div style="font-size: 9px; font-family: Helvetica; width: 100%; text-align: center; color: #666;"><span class="pageNumber"></span></div>',
        margin: {
            top: '25mm',
            bottom: '25mm',
            left: '20mm',
            right: '20mm'
        }
    });

    await browser.close();
    console.log("PDF generated successfully: The_Quanta_Programming_Language.pdf");
}

generatePDF().catch(console.error);
