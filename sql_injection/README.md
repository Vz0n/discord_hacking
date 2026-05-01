To query relational databases (database with tables), applications can use of a language called SQL (Structured Query Language). On that language, a query to get users with age greater 18 is:

```sql
SELECT name FROM users WHERE age > 18; 
```

As the name says, this vulnerability is basically having the possibility to inject SQL sentences and get things that you shouldn't see:

```sql
-- You get this by injecting "0 UNION SELECT password FROM admin users --"
SELECT name FROM users WHERE age > 0 UNION SELECT password FROM admin_users -- ; 
```

Depending of the application, it may return all the data, just show a `true` or `false`, or just throw an error because the returned data is not the expected. With functions like `sleep()` and watching how the application behaves when something exists and when no, gives you the ability to extract sensitive data from the website. 