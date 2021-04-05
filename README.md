# js-trailing-closure-toy-compiler

这个简单的编译器可以编译我们在`JavaScript`中使用的`Swift`的尾闭包语法，将其变成正常的`JavaScript`语法。

关于`Swift`的尾闭包如果你不是很理解，可以参考`Swift`关于 [Closures](https://docs.swift.org/swift-book/LanguageGuide/Closures.html) 的文档

通过这个编译器我们可以将下面的代码：
```javascript
a(){}
```
转换为：
```javascript
a(() => {});
```

或者将：
```javascript
a(1, "hello"){ b, c in
    d()
    d{}
    d(1, "hello")
    d(1, "hello"){}
    d(1, "hello"){ e, f in
        g()
    }
}
```
转换为：
```javascript
a(1, "hello", (b, c) => {
    d();
    d(() => {});
    d(1, "hello");
    d(1, "hello", () => {});
    d(1, "hello", (e, f) => {
        g()
    })
})
```

项目的在线演示地址：[JavaScript Trailing Closure Toy Compiler](https://dreamapple.gitee.io/code-examples/2021/0404/)

关于项目代码部分的详细解释可以阅读这篇文章：[动手写一个简单的编译器：在JavaScript中使用Swift的尾闭包语法](https://github.com/dreamapplehappy/blog/tree/master/2021/04/05)

如果你对这个项目有什么建议和意见，欢迎提 [issues](https://github.com/dreamapplehappy/js-trailing-closure-toy-compiler/issues) 或者 [Pull requests](https://github.com/dreamapplehappy/js-trailing-closure-toy-compiler/pulls)

这个项目受到 [jamiebuilds](https://github.com/jamiebuilds) 的 [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler) 项目的启发，参考了里面的一些内容。

---
![Creative Commons License](https://i.creativecommons.org/l/by/4.0/80x15.png)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0).

