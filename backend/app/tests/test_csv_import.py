from app.services.csv_import import import_sales_csv


def test_csv_import_validation_and_dedupe(db_session):
    content = b"timestamp,item,category,quantity,unit_price,payment_method,store,order_type\n2026-09-01T08:10:00,Latte,Coffee,2,210,UPI,Indiranagar,Dine-in\n2026-09-01T08:10:00,Latte,Coffee,2,210,UPI,Indiranagar,Dine-in\ninvalid,Latte,Coffee,2,210,UPI,Indiranagar,Dine-in\n"
    result = import_sales_csv(db_session, "sales.csv", content, persist=True)

    assert result.total_rows == 3
    assert result.valid_rows == 2
    assert result.imported_rows == 1
    assert result.duplicates_skipped == 1
    assert result.warnings == 1
