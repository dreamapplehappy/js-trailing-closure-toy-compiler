const assert = require('assert');
const {
    tokenizer,
    parser,
    transformer,
    codeGenerator,
    compiler
} = require('./js-trailing-closure-toy-compiler');

const input = `
a(1){
}
a{
}
`;

// tokens
const tokens = [{type:'Identifier',value:'a'},
    {type:'ParenLeft',value:'('},
    {type:'NumericLiteral',value:'1'},
    {type:'ParenRight',value:')'},
    {type:'BraceLeft',value:'{'},
    {type:'BraceRight',value:'}'},
    {type:'Identifier',value:'a'},
    {type:'BraceLeft',value:'{'},
    {type:'BraceRight',value:'}'}];

// jtc AST
const jtcAst = {
    type:'Program',
    body:[{type:'CallExpression',
        value:'a',
        params:[{type:'NumericLiteral',value:'1',parentType:'ARGUMENTS_PARENT_TYPE'}],
        hasTrailingBlock:true,
        trailingBlockParams:[],
        trailingBody:[]},
        {type:'CallExpression',
            value:'a',
            params:[],
            hasTrailingBlock:true,
            trailingBlockParams:[],
            trailingBody:[]}]};

const newAst = {
    type:'Program',
    body:[
        {type:'CallExpression',
            callee:{type:'Identifier',name:'a'},
            arguments:[{type:'NumericLiteral',value:'1'},
                {type:'ArrowFunctionExpression',
                    arguments:[],
                    blockBody:[]}],
            blockBody:[]},
        {type:'CallExpression',
            callee:{type:'Identifier',name:'a'},
            arguments:[
                {type:'ArrowFunctionExpression',
                    arguments:[],
                    blockBody:[]}],
            blockBody:[]}]};

const output = `a(1, () => {});
a(() => {})`;

assert.deepStrictEqual(tokenizer(input), tokens, 'Tokenizer should turn `input` string into `tokens` array');
assert.deepStrictEqual(parser(tokens), jtcAst, 'Parser should turn `tokens` array into `jtcAst` object');
assert.deepStrictEqual(transformer(jtcAst), newAst, 'Transformer should turn `jtcAst` Object into `newAst` object');
assert.deepStrictEqual(codeGenerator(newAst), output, 'CodeGenerator should turn `newAst` Object into `output` string');
assert.deepStrictEqual(compiler(input), output, 'Compiler should turn `input` string into `output` string');

console.log('All test cases passed!');


