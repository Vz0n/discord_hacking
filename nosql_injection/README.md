NoSQL is a subset of the query languages that as his name says, it does not use the SQL standards, they for, example, use JSON with operators to make queries, and uses structures like documents instead of tables.

One of the well known NoSQL engines is MongoDB. For example, to make a query that find users with an age greater than 18 in this engine, you use:

```js
db.users.find({age: {"$gt": 18}});
```

That `$gt` is the MongoDB operator for $\gt$. When you can control the application query by injecting operators like that one, you're indeed injecting NoSQL.

