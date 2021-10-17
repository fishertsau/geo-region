import R from 'ramda';
import { map, pipe, fromPairs } from 'ramda';

const hasEn = (region) => R.prop('en_name')(region) !== '';

describe('foo', () => {
  it('bar', () => {
    const foo = [
      {
        id: 100,
        country_id: 1,
        country: 'CN',
        region: '14',
        en_name: '',
        zh_tw_name: '',
        zh_cn_name: '',
      },
      {
        id: 101,
        country_id: 9,
        country: 'VN',
        region: '27',
        en_name: 'Tinh Quang Nam',
        zh_tw_name: '',
        zh_cn_name: '',
      },
      {
        id: 103,
        country_id: 9,
        country: 'VN',
        region: '28',
        en_name: 'FoodIsGood',
        zh_tw_name: '',
        zh_cn_name: '',
      },
    ];

    const getEnName = (r) => {
      const key = `COMMON_CITY_ID_${r.id}`;
      const value = R.prop('en_name')(r);
      return [key, value];
    };

    const byId = (a, b) => (a.id > b.id) ? 1 : -1;
    const result = pipe(R.filter(hasEn), R.sort(byId), map(getEnName), fromPairs)(foo); //?
    result;
  });

});