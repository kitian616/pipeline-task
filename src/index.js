"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parallel = exports.series = void 0;
function series(...funcs) {
    if (funcs.length === 0) {
        return arg => arg;
    }
    if (funcs.length === 1) {
        return funcs[0];
    }
    return funcs.reduce((prevFn, nextFn) => (...args) => __awaiter(this, void 0, void 0, function* () { return nextFn(yield prevFn(...args)); }));
}
exports.series = series;
function parallel(...fns) {
    if (fns.length === 0) {
        return arg => arg;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.all(fns.map(fn => fn(...args)));
        return results.reduce((a, b) => (Object.assign(Object.assign({}, a), b)));
    });
}
exports.parallel = parallel;
;
const getLoginInfo = (ctx) => {
    const userId = 'user_1234';
    return Object.assign(Object.assign({}, ctx), { userId });
};
const getUserData = (ctx) => {
    const { userId } = ctx;
    const getData = (userId) => {
        return {
            userId,
            userName: '1234',
            avatar: 'path-to-avatar',
        };
    };
    return Object.assign(Object.assign({}, ctx), { userData: getData(userId) });
};
;
const getUserArticles = (ctx) => {
    const { userId } = ctx;
    const getData = (userId) => {
        return [{
                title: 'article1',
                description: 'article1',
                tags: ['tag1', 'tag2']
            }, {
                title: 'article2',
                description: 'article2',
                tags: ['tag1', 'tag3']
            }];
    };
    return Object.assign(Object.assign({}, ctx), { articles: getData(userId) });
};
const getTagsInfo = (ctx) => {
    const { articles } = ctx;
    const getData = (tagIds) => {
        return tagIds.map((tagId => {
            return {
                id: tagId,
                name: tagId + ' Tag',
            };
        }));
    };
    return Object.assign(Object.assign({}, ctx), { articles: ctx.articles.map(article => (Object.assign(Object.assign({}, article), { tags: getData(article.tags) }))) });
};
const runTasks = () => __awaiter(void 0, void 0, void 0, function* () {
    const ctx = {};
    // const r1 = getUserData(getLoginInfo(ctx));
    // getLoginInfo(getUserData(ctx)); // wrong
    const r3 = yield series(getLoginInfo, parallel(getUserData, series(getUserArticles, getTagsInfo)))(ctx);
    // series(getUserData ,getLoginInfo)(ctx); // wrong
    // console.log('r1');
    // console.log(r1);
    console.log('r3');
    console.log(r3);
});
runTasks();
