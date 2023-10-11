/* eslint-disable import/export */
export type Task<T0, T1> = (x0: T0) => T1 | PromiseLike<T1>;
export type Series<T0, T1> = (x0: T0) => Promise<T1>;
export type Parallel<T0, T1> = (x0: T0) => Promise<T1>;

export function series <T0>() : (x0: T0) => T0;
export function series <T0, T1>(fn0: Task<T0, T1>) : Task<T0, T1>;
export function series <T0, T1, T2>(fn0: Task<T0, T1>, fn1: Task<T1, T2>) : Series<T0, T2>;
export function series <T0, T1, T2, T3>(fn0: Task<T0, T1>, fn1: Task<T1, T2>, fn2: Task<T2, T3>) : Series<T0, T3>;
export function series <T0, T1, T2, T3, T4>(fn0: Task<T0, T1>, fn1: Task<T1, T2>, fn2: Task<T2, T3>, fn3: Task<T3, T4>) : (x0: T0) => Series<T0, T4>;

export function series(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
      return funcs[0]
  }

  return funcs.reduce((prevFn, nextFn) => async (...args) => nextFn(await prevFn(...args)));
}

export function parallel <T0>() : (x0: T0) => T0;
export function parallel <T0, T1>(fn0: Task<T0, T1>) : Task<T0, T1>;
export function parallel <T0, T1, T2>(fn0: Task<T0, T1>, fn1: Task<T0, T2>) : Parallel<T0, T1 & T2>;
export function parallel <T0, T1, T2, T3>(fn0: Task<T0, T1>, fn1: Task<T0, T2>, fn2: Task<T0, T3>) : Parallel<T0, T1 & T2 & T3>;
export function parallel <T0, T1, T2, T3, T4>(fn0: Task<T0, T1>, fn1: Task<T0, T2>, fn2: Task<T0, T3>, fn3: Task<T0, T4>) : (x0: T0) => Parallel<T0, T1 & T2 & T3 & T4>;

export function parallel (...fns) {
  if (fns.length === 0) {
    return arg => arg
  }

  if (fns.length === 1) {
      return fns[0]
  }

  return async (...args) => {
    const results = await Promise.all(fns.map(fn => fn(...args)));
    // 这里的处理是非线程安全的，并行和并发有不同处理方法，后续补上。
    return results.reduce((a, b) => ({ ...a, ...b }));
  }
}


export interface BaseContext {};

const getLoginInfo = (ctx: BaseContext) => {
  const userId = 'user_1234';
  return {
    ...ctx,
    userId,
  }
};

const getUserData = (ctx: BaseContext & { userId: string }) => {
  const { userId } = ctx;
  const getData = (userId: string) => {
    return {
      userId,
      userName: '1234',
      avatar: 'path-to-avatar',
    }
  }
  return {
    ...ctx,
    userData: getData(userId),
  };
};

interface Article{
  title: string;
  description: string;
  tags: string[];
};

const getUserArticles = (ctx: BaseContext & { userId: string }) => {
  const { userId } = ctx;
  const getData = (userId: string) : Article[] => {
    return [{
      title: 'article1',
      description: 'article1',
      tags: ['tag1', 'tag2']
    }, {
      title: 'article2',
      description: 'article2',
      tags: ['tag1', 'tag3']
    }];
  }
  return {
    ...ctx,
    articles: getData(userId),
  };
};

const getTagsInfo = (ctx: BaseContext & { articles: Article[] }) => {
  const { articles } = ctx;
  const getData = (tagIds: string[]) => {
    return tagIds.map((tagId => {
      return {
        id: tagId,
        name: tagId + ' Tag',
      };
    }))
  };
  return {
    ...ctx,
    articles: ctx.articles.map(article => ({
      ...article,
      tags: getData(article.tags)
    })),
  }
};

const runTasks = async () => {
  const ctx: BaseContext = {};

  // const r1 = getUserData(getLoginInfo(ctx));
  // getLoginInfo(getUserData(ctx)); // wrong
  const r3 = await series(getLoginInfo, parallel(getUserData, series(getUserArticles, getTagsInfo)))(ctx);
  // series(getUserData ,getLoginInfo)(ctx); // wrong

  // console.log('r1');
  // console.log(r1);
  console.log('r3');
  console.log(r3);
};

runTasks();
