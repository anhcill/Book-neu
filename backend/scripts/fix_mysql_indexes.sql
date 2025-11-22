-- Script để xóa các index trùng lặp trong MySQL
-- Chạy script này trong MySQL Workbench hoặc command line

USE database_book;

-- Xem tất cả index trong table users
SHOW INDEX FROM users;

-- Xóa các index trùng lặp (giữ lại PRIMARY và các index cần thiết)
-- Ví dụ xóa index trùng lặp trên email nếu có
-- ALTER TABLE users DROP INDEX email;

-- Nếu có nhiều index trùng lặp trên cùng column, chỉ giữ lại 1
-- Kiểm tra các table khác cũng có thể có vấn đề tương tự
SHOW INDEX FROM products;
SHOW INDEX FROM cart_items;
SHOW INDEX FROM orders;

-- Nếu cần, xóa index không cần thiết:
-- ALTER TABLE users DROP INDEX email_2;
-- ALTER TABLE users DROP INDEX email_3;
-- ... (tùy vào tên index thực tế)

-- Sau khi xóa xong, restart server để sync lại
SELECT 'Run this script to fix MySQL index issues' as message;