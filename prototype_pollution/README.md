JavaScript is very well know for their weirdness on types and that stuff. One thing that make the language as it is, are prototypes.

A prototype of an object is basically, as it name suggests, a "skeleton" for the objects that can be derived from it. For example, the prototype of `Object` (the base class in JavaScript) contains these methods and properties:

```js
> let t = {}
undefined
> t.__proto__.
t.__proto__.__proto__             t.__proto__.constructor           t.__proto__.hasOwnProperty        t.__proto__.isPrototypeOf
t.__proto__.propertyIsEnumerable  t.__proto__.toLocaleString        t.__proto__.toString              t.__proto__.valueOf
```

Every object that you can create, will contain those properties:


```js
> t.
t.__proto__             t.constructor           t.hasOwnProperty        t.isPrototypeOf         t.propertyIsEnumerable  t.toLocaleString
t.toString              t.valueOf
```

A thing that makes one wonder is what happens if I edit the prototype of the object... what will happen is that, every object that you create after editing the prototype, will contain the edited prototype, and implies that they will have the property that you edited


```js
> t.__proto__.t = "f(t)"
'f(t)'
> let x = {}
undefined
> x.t
'f(t)'
```

You can't only create new properties, but also edit the previously created ones. For example, you can replace the `toString` method... and replacing it will make the application crash, because it's called on every thing that needs to be represented as a string:

```js
> y.toString()
Uncaught TypeError: y.toString is not a function
```

Some JavaScript functions accepts objects as input and does things is a property is setted. With this, you could trigger that. As an example, consider this function:

```js
function f(X){
    if(X.isAdmin){
        return "here's my cock daddy";
    }

    return "What you're looking at?";
}
```

If somehow, you manage to edit the Object prototype to set an attribute `isAdmin` with value `true`, you will be able to get the cock.

With this, you should see where things are going if you can *pollute* prototypes.

> The `Object.constructor.prototype` property is also a prototype but for all created objects, this means that if you edit it, every object already created and those which will be created will have the edit that you did.