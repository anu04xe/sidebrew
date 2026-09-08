from __future__ import annotations

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_brief_pdf(brief: dict) -> bytes:
    buff = BytesIO()
    doc = SimpleDocTemplate(buff, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    story = [
        Paragraph("<b>SIDEBREW</b>", styles["Title"]),
        Paragraph("Morning Brief", styles["Heading2"]),
        Paragraph(f"Generated: {brief['generated_at'].strftime('%d %b %Y · %H:%M')}", styles["Normal"]),
        Paragraph(f"Scope: {brief['scope_store']}", styles["Normal"]),
        Spacer(1, 12),
    ]

    kpi_data = [[k["label"], k["formatted"], "N/A" if k["change_pct"] is None else f"{k['change_pct']:+.1f}%"] for k in brief["kpis"]]
    if kpi_data:
        t = Table([["Metric", "Value", "Vs Baseline"]] + kpi_data)
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0ece2")),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#ad9f8b")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]
            )
        )
        story += [t, Spacer(1, 12)]

    story.append(Paragraph("<b>Things Worth Noticing</b>", styles["Heading3"]))
    if brief["observations"]:
        for idx, obs in enumerate(brief["observations"][:5], 1):
            story.append(Paragraph(f"{idx:02d}. <b>{obs['title'].title()}</b> — {obs['explanation']}", styles["Normal"]))
    else:
        story.append(Paragraph("No significant anomalies detected.", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Inventory Warnings</b>", styles["Heading3"]))
    for risk in brief["inventory_risks"][:5]:
        suffix = "REORDER" if risk["reorder_recommended"] else "OK"
        days = "N/A" if risk["estimated_days_remaining"] is None else f"{risk['estimated_days_remaining']:.1f} days"
        story.append(
            Paragraph(
                f"{risk['item']}: {risk['current_quantity']} {risk['unit']} left · {risk['average_daily_usage']} {risk['unit']}/day · {days} · {suffix}",
                styles["Normal"],
            )
        )

    story += [Spacer(1, 12), Paragraph("<b>Today's Actions</b>", styles["Heading3"])]
    for action in brief["actions"][:5]:
        story.append(Paragraph(f"→ {action}", styles["Normal"]))

    doc.build(story)
    return buff.getvalue()
