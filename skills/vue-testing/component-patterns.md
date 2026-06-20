# Component Test Patterns（Vue 2 / Nuxt 2）

適用：按鈕互動、Props/Emit、DOM 顯示、表單輸入、v-if/v-show 狀態。

## 基本骨架

```js
import { shallowMount } from '@vue/test-utils';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(MyComponent, {
      propsData: { value: 'test' },
    });
  });

  afterEach(() => wrapper.destroy());

  // AC-01: ...
  it('AC-01: should show error when input is empty', async () => {
    // When
    await wrapper.find('[data-test="input"]').setValue('');
    await wrapper.find('[data-test="submit"]').trigger('click');
    // Then
    expect(wrapper.find('[data-test="error-msg"]').text()).toBe('必填');
  });
});
```

## shallowMount vs mount

| 情境 | 選擇 |
|------|------|
| 測試 component 本身邏輯（子元件不重要） | `shallowMount`（預設） |
| 測試跨子元件的互動或 slot | `mount` |

## DOM 查詢優先順序

1. `[data-test="xxx"]` — 最穩定，不受 CSS class 重構影響
2. 語意化文字（`wrapper.text().includes(...)`）
3. 避免 `.find('.some-class')`（CSS 實作細節）

## Props 與 Emit 測試

```js
// Props
wrapper = shallowMount(MyComp, { propsData: { disabled: true } });
expect(wrapper.find('button').attributes('disabled')).toBeDefined();

// Emit
await wrapper.find('[data-test="btn"]').trigger('click');
expect(wrapper.emitted('confirm')).toBeTruthy();
expect(wrapper.emitted('confirm')[0]).toEqual([expectedPayload]);
```

## Vuex Store Mock（createLocalVue）

```js
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  state: { user: { name: 'Test' } },
  getters: { userName: (s) => s.user.name },
});

wrapper = shallowMount(MyComp, { localVue, store });
```

## 非同步操作

```js
it('AC-03: should show result after API call', async () => {
  jest.spyOn(apiService, 'fetchData').mockResolvedValue(mockResult);
  await wrapper.find('[data-test="load-btn"]').trigger('click');
  await wrapper.vm.$nextTick();
  // 或使用 flushPromises()
  expect(wrapper.find('[data-test="result"]').text()).toBe('success');
});
```
