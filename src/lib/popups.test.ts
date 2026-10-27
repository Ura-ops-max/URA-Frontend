import { describe, expect, it } from 'vitest';
import { addPopup, popupFromNotification, removePopup, type Popup } from './popups';

const p = (id: string): Popup => ({ id, text: id, link: null, isOrder: false });

describe('pop-up stack', () => {
  it('puts the newest on top and keeps 3 at most', () => {
    let list: Popup[] = [];
    for (const id of ['a', 'b', 'c', 'd']) list = addPopup(list, p(id));
    expect(list.map((x) => x.id)).toEqual(['d', 'c', 'b']);
  });
  it('never shows the same notification twice', () => {
    const list = addPopup(addPopup([], p('a')), p('a'));
    expect(list).toHaveLength(1);
  });
  it('closes one', () => {
    expect(removePopup([p('a'), p('b')], 'a').map((x) => x.id)).toEqual(['b']);
  });
});

describe('pop-up from a notification', () => {
  it('a paid order shows the server line and opens the order', () => {
    const popup = popupFromNotification({
      _id: 'n1',
      title: 'New paid order ORD-1042',
      message: 'Amaka O. just paid for 2x Chicken shawarma. ₦12,000. You get ₦12,000 when...',
      summary: 'Amaka O. just paid for 2x Chicken shawarma. ₦12,000',
      modelType: 'Order',
      relatedId: 'o1',
    });
    expect(popup).toEqual({
      id: 'n1',
      text: 'Amaka O. just paid for 2x Chicken shawarma. ₦12,000',
      link: '/dashboard/orders/o1',
      isOrder: true,
    });
  });
  it('other notices show their own message', () => {
    expect(popupFromNotification({ _id: 'n2', title: 'New like', message: 'Sade liked your post', modelType: 'Post' }).text).toBe(
      'Sade liked your post',
    );
  });
});
