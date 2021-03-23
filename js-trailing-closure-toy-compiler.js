
const BLOCK_PARENT_TYPE = 'BLOCK_PARENT_TYPE';
const ARGUMENTS_PARENT_TYPE = 'ARGUMENTS_PARENT_TYPE';

// 将字符串解析为Tokens
const tokenizer = (input) => {
    // 简单的正则
    const numReg = /\d/;
    const idReg = /[a-z]/i;
    const spaceReg = /\s/;

    // Tokens 数组
    const tokens = [];

    // 判断 input 的长度
    const len = input.length;
    if (len > 0) {
        let cur = 0;
        while(cur < len) {
            let curChar = input[cur];

            // 判断是否是数字
            if (numReg.test(curChar)) {
                let num = '';
                while(numReg.test(curChar) && curChar) {
                    num += curChar;
                    curChar = input[++cur];
                }
                tokens.push({
                    type: 'NumericLiteral',
                    value: num
                });
                continue;
            }

            // 判断是否是标识符
            if (idReg.test(curChar)) {
                let idVal = '';
                while(idReg.test(curChar) && curChar) {
                    idVal += curChar;
                    curChar = input[++cur];
                }

                // 判断是否是 in 关键字
                if (idVal === 'in') {
                    tokens.push({
                        type: 'InKeyword',
                        value: idVal
                    });
                } else {
                    tokens.push({
                        type: 'Identifier',
                        value: idVal
                    });
                }
                continue;
            }

            // 判断是否是字符串
            if (curChar === '"') {
                let strVal = '';
                curChar = input[++cur];
                while(curChar !== '"') {
                    strVal += curChar;
                    curChar = input[++cur];
                }
                tokens.push({
                    type: 'StringLiteral',
                    value: strVal
                });
                // 需要处理字符串的最后一个双引号
                cur++;
                continue;
            }

            // 判断是否是左括号
            if (curChar === '(') {
                tokens.push({
                    type: 'ParenLeft',
                    value: '('
                });
                cur++;
                continue;
            }

            // 判断是否是右括号
            if (curChar === ')') {
                tokens.push({
                    type: 'ParenRight',
                    value: ')'
                });
                cur++;
                continue;
            }

            // 判断是否是左花括号
            if (curChar === '{') {
                tokens.push({
                    type: 'BraceLeft',
                    value: '{'
                });
                cur++;
                continue;
            }

            // 判断是否是右花括号
            if (curChar === '}') {
                tokens.push({
                    type: 'BraceRight',
                    value: '}'
                });
                cur++;
                continue;
            }

            // 判断是否是逗号
            if (curChar === ',') {
                tokens.push({
                    type: 'Comma',
                    value: ','
                });
                cur++;
                continue;
            }

            // 判断是否是空白符号
            if (spaceReg.test(curChar)) {
                cur++;
                continue;
            }

            throw new Error(`${curChar} is not a good character`);
        }
    }

    console.log(tokens, tokens.length);
    return tokens;
};

// 将 Tokens 转换为 AST
const parser = (tokens) => {
    const ast = {
        type: 'Program',
        body: []
    };

    let cur = 0;

    const walk = () => {
        let token = tokens[cur];

        // 是数字直接返回
        if (token.type === 'NumericLiteral') {
            cur++;
            return {
                type: 'NumericLiteral',
                value: token.value
            };
        }

        // 是字符串直接返回
        if (token.type === 'StringLiteral') {
            cur++;
            return {
                type: 'StringLiteral',
                value: token.value
            };
        }

        // 是逗号直接返回
        if (token.type === 'Comma') {
            cur++;
            return;
        }

        // 如果是标识符，在这里我们只有函数的调用，所以需要判断函数有没有其它的参数
        if (token.type === 'Identifier') {
            const callExp = {
                type: 'CallExpression',
                value: token.value,
                params: [],
                hasTrailingBlock: false,
                trailingBlockParams: [],
                trailingBody: []
            };
            const handleBraceBlock = () => {
                callExp.hasTrailingBlock = true;
                // 收集闭包函数的参数
                token = tokens[++cur];
                const params = [];
                const blockBody = [];
                let isParamsCollected = false;
                while(token.type !== 'BraceRight') {
                    if (token.type === 'InKeyword') {
                        callExp.trailingBlockParams = params;
                        isParamsCollected = true;
                        token = tokens[++cur];
                    } else {
                        if (!isParamsCollected) {
                            params.push(walk());
                            token = tokens[cur];
                        } else {
                            // 处理花括号里面的数据
                            blockBody.push(walk());
                            token = tokens[cur];
                        }
                    }
                }
                // 如果 isParamsCollected 到这里还是 false，说明花括号里面没有参数
                if (!isParamsCollected) {
                    // 如果没有参数 收集的就不是参数了
                    callExp.trailingBody = params;
                } else {
                    callExp.trailingBody = blockBody;
                }
                // 处理逗号
                callExp.params = callExp.params.filter(p => p);
                callExp.trailingBlockParams = callExp.trailingBlockParams.filter(p => p);
                callExp.trailingBody = callExp.trailingBody.filter(p => p);

                // 指定节点的类型， 方便后面使用 TODO >0
                callExp.params.forEach((node) => {
                    node.parentType = ARGUMENTS_PARENT_TYPE;
                });
                callExp.trailingBlockParams.forEach((node) => {
                    node.parentType = ARGUMENTS_PARENT_TYPE;
                });
                callExp.trailingBody.forEach((node) => {
                    node.parentType = BLOCK_PARENT_TYPE;
                });
                // 处理右边的花括号
                cur++;
            };
            // 判断后面紧接着的 token 是 `(` 还是 `{`
            // 需要判断当前的 token 是函数调用还是参数
            const next = tokens[cur + 1];
            if (next.type === 'ParenLeft' || next.type === 'BraceLeft') {
                token = tokens[++cur];
                if (token.type === 'ParenLeft') {
                    // 需要收集函数的参数
                    // 需要判断下一个 token 是否是 `)`
                    token = tokens[++cur];
                    while(token.type !== 'ParenRight') {
                        callExp.params.push(walk());
                        token = tokens[cur];
                    }
                    // 处理右边的圆括号
                    cur++;
                    // 获取 `)` 后面的 token
                    token = tokens[cur];
                    // 处理后面的尾部闭包；需要判断 token 是否存在 考虑`func()`
                    if (token && token.type === 'BraceLeft') {
                        handleBraceBlock();
                    }
                } else {
                    handleBraceBlock();
                }
                // // 处理逗号 TODO 优化，和上面的
                // callExp.params = callExp.params.filter(p => p);
                // callExp.trailingBlockParams = callExp.trailingBlockParams.filter(p => p);
                return callExp;
            } else {
                cur++;
                return {
                    type: 'Identifier',
                    value: token.value
                };
            }
        }

        throw new Error(`this ${token} is not a good token`);
    };

    while (cur < tokens.length) {
        ast.body.push(walk());
    }

    console.log(ast);
    return ast;
};

// 将 AST 装换为目标语言的 AST
// 遍历节点
const traverser = (ast, visitor) => {
    const traverseNode = (node, parent) => {

        const method = visitor[node.type];
        if (method && method.enter) {
            method.enter(node, parent);
        }

        const t = node.type;
        switch (t) {
            case 'Program':
                traverseArr(node.body, node);
                break;
            case 'CallExpression':
                // 处理 ArrowFunctionExpression
                // TODO 考虑body 里面存在尾部闭包
                if (node.hasTrailingBlock) {
                    node.params.push({
                        type: 'ArrowFunctionExpression',
                        parentType: ARGUMENTS_PARENT_TYPE,
                        params: node.trailingBlockParams,
                        body: node.trailingBody
                    });
                    traverseArr(node.params, node);
                } else {
                    traverseArr(node.params, node);
                }
                break;
            case 'ArrowFunctionExpression':
                traverseArr(node.params, node);
                traverseArr(node.body, node);
                break;
            case 'Identifier':
            case 'NumericLiteral':
            case 'StringLiteral':
                break;
            default:
                throw new Error(`this type ${t} is not a good type`);
        }

        if (method && method.exit) {
            method.exit(node, parent);
        }
    };
    const traverseArr = (arr, parent) => {
        arr.forEach((node) => {
            traverseNode(node, parent);
        });
    };
    traverseNode(ast, null);
};
const transformer = (ast) => {
    const newAst = {
        type: 'Program',
        body: []
    };

    ast._container = newAst.body;

    const getNodeContainer = (node, parent) => {
        const parentType = node.parentType;
        if (parentType) {
            if (parentType === BLOCK_PARENT_TYPE) {
                return parent._bodyContainer;
            }
            if (parentType === ARGUMENTS_PARENT_TYPE) {
                return parent._argumentsContainer;
            }
        } else {
            return parent._container;
        }
    };

    traverser(ast, {
        NumericLiteral: {
            enter: (node, parent) => {
                getNodeContainer(node, parent).push({
                    type: 'NumericLiteral',
                    value: node.value
                });
            }
        },
        StringLiteral: {
            enter: (node, parent) => {
                getNodeContainer(node, parent).push({
                    type: 'StringLiteral',
                    value: node.value
                });
            }
        },
        Identifier: {
            enter: (node, parent) => {
                getNodeContainer(node, parent).push({
                    type: 'Identifier',
                    name: node.value
                });
            }
        },
        CallExpression: {
            enter: (node, parent) => {
                // TODO 优化一下
                const callExp = {
                    type: 'CallExpression',
                    callee: {
                        type: 'Identifier',
                        name: node.value
                    },
                    arguments: [],
                    blockBody: []
                };
                // 给参数添加 _container
                node._argumentsContainer = callExp.arguments;
                node._bodyContainer = callExp.blockBody;
                getNodeContainer(node, parent).push(callExp);
            }
        },
        ArrowFunctionExpression: {
            enter: (node, parent) => {
                // TODO 优化一下
                const arrowFunc = {
                    type: 'ArrowFunctionExpression',
                    arguments: [],
                    blockBody: []
                };
                // 给参数添加 _container
                node._argumentsContainer = arrowFunc.arguments;
                node._bodyContainer = arrowFunc.blockBody;
                getNodeContainer(node, parent).push(arrowFunc);
            }
        }
    });
    console.log(newAst);
    return newAst;
};

// 生成代码
const codeGenerator = (node) => {
    const type = node.type;
    switch (type) {
        case 'Program':
            return node.body.map(codeGenerator).join(';\n');
        case 'Identifier':
            return node.name;
        case 'NumericLiteral':
            return node.value;
        case 'StringLiteral':
            return `"${node.value}"`;
        case 'CallExpression':
            return `${codeGenerator(node.callee)}(${node.arguments.map(codeGenerator).join(', ')})`;
        case 'ArrowFunctionExpression':
            return `(${node.arguments.map(codeGenerator).join(', ')}) => {${node.blockBody.map(codeGenerator).join(';')}}`;
        default:
            throw new Error(`this type ${type} is not a good type`);
    }
};

// 组装
const compiler = (input) => {
    const tokens = tokenizer(input);
    const ast = parser(tokens);
    const newAst = transformer(ast);
    return codeGenerator(newAst);
};

// 导出对应的模块
module.exports = {
    tokenizer,
    parser,
    transformer,
    codeGenerator,
    compiler
};
