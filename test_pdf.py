#!/usr/bin/env python3

import io
import random
import string
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT

def create_test_report():
    """Create a test PDF report matching your format"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=50, bottomMargin=50)
    
    # Custom styles
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=10,
        textColor=colors.black,
        alignment=TA_LEFT,
        fontName='Helvetica-Bold'
    )
    
    # Content style
    content_style = ParagraphStyle(
        'ContentStyle',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        textColor=colors.black,
        alignment=TA_LEFT,
        fontName='Helvetica'
    )
    
    # Section header style
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=10,
        spaceBefore=20,
        textColor=colors.black,
        alignment=TA_LEFT,
        fontName='Helvetica-Bold'
    )
    
    # Story elements
    story = []
    
    # Title and underline - matching your PDF exactly
    story.append(Paragraph("INDsafe.ai Image Analysis Report", title_style))
    story.append(Paragraph("=" * 60, content_style))
    
    # Report metadata - matching your format
    current_time = datetime.now().strftime('%d/%m/%Y, %H:%M:%S')
    story.append(Paragraph(f"Generated: {current_time}", content_style))
    story.append(Paragraph(f"Analyzed by: varunkumarcs22055", content_style))
    story.append(Spacer(1, 20))
    
    # Test with fake image detection
    prediction = 0.3  # Fake
    confidence = abs(prediction - 0.5) * 2
    verdict = "DEEPFAKE DETECTED"
    
    # Generate unique analysis ID
    analysis_id = 'ind_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8)) + '_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    
    # IMAGE ANALYSIS RESULTS Section
    story.append(Paragraph("IMAGE ANALYSIS RESULTS", section_style))
    story.append(Paragraph("- - - - - - - - - - - - - - - - - -", content_style))
    
    story.append(Paragraph(f"Verdict: {verdict}", content_style))
    story.append(Paragraph(f"Confidence: {confidence:.0%}", content_style))
    story.append(Paragraph(f"File: deep.jpg", content_style))
    story.append(Paragraph(f"Size: 0.24 MB", content_style))
    story.append(Paragraph(f"Analysis ID: {analysis_id}", content_style))
    story.append(Spacer(1, 20))
    
    # DETECTION FACTORS Section
    story.append(Paragraph("DETECTION FACTORS", section_style))
    story.append(Paragraph("- - - - - - - - - - - - - - - -", content_style))
    
    factors = [
        "1. Metadata inconsistencies (Medium confidence)",
        "2. Facial proportion anomalies (Medium confidence)",
        "3. Unusual skin texture (High confidence)"
    ]
    
    for factor in factors:
        story.append(Paragraph(factor, content_style))
    
    story.append(Spacer(1, 20))
    
    # ANALYSIS SUMMARY Section
    story.append(Paragraph("ANALYSIS SUMMARY", section_style))
    story.append(Paragraph("- - - - - - - - - - - - - - -", content_style))
    
    summary = "This image appears to be manipulated with AI-generated content detected. The analysis suggests this may be a deepfake or digitally altered image."
    story.append(Paragraph(summary, content_style))
    story.append(Spacer(1, 20))
    
    # TECHNICAL DETAILS Section
    story.append(Paragraph("TECHNICAL DETAILS", section_style))
    story.append(Paragraph("- - - - - - - - - - - - - - -", content_style))
    
    story.append(Paragraph("- Analysis Method: Deep Learning Neural Network", content_style))
    story.append(Paragraph("- Model: Xception-based Deepfake Detection", content_style))
    story.append(Paragraph("- Processing Time: 1.7s", content_style))
    story.append(Paragraph("- Image Resolution: Analyzed at full resolution", content_style))
    story.append(Paragraph("- File Format: JPG", content_style))
    story.append(Spacer(1, 20))
    
    # RECOMMENDATIONS Section
    story.append(Paragraph("RECOMMENDATIONS", section_style))
    story.append(Paragraph("- - - - - - - - - - - - - - -", content_style))
    
    recommendation = "Based on this analysis, the image shows signs of manipulation. We recommend verifying the source and context of this image before using it as evidence or sharing it."
    story.append(Paragraph(recommendation, content_style))
    story.append(Spacer(1, 30))
    
    # Footer
    story.append(Paragraph("INDsafe.ai - Protecting truth in the digital age", content_style))
    story.append(Paragraph(f"Report ID: {analysis_id}", content_style))
    story.append(Paragraph(f"Generated at: {current_time}", content_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer

if __name__ == "__main__":
    try:
        print("🔄 Generating test PDF report...")
        buffer = create_test_report()
        
        # Save to file
        with open('test_indsafe_report.pdf', 'wb') as f:
            f.write(buffer.getvalue())
        
        print("✅ Test PDF report generated successfully!")
        print(f"📄 Saved as: test_indsafe_report.pdf")
        print(f"📊 File size: {len(buffer.getvalue())} bytes")
        
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        import traceback
        traceback.print_exc()
