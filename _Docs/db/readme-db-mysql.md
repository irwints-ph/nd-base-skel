mysql -h 192.168.100.175 -u root -prootpassword123

create database nd_app;
GRANT ALL PRIVILEGES ON nd_app.* 
TO 'approot'@'%';
