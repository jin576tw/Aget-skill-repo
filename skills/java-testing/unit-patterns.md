# Unit Test Patterns（Java）

適用：Service / Domain 純邏輯、Controller slice（不需 Spring context）。

## 測試框架組合

```java
@ExtendWith(MockitoExtension.class)
class FooServiceTest {

    @Mock
    FooDependency dependency;

    @InjectMocks
    FooService service;
}
```

## 優先驗證內容

- 金額計算、日期推算、商業規則判斷
- DTO → Command / Domain model 轉換
- 狀態機轉換、錯誤碼對應
- null / 空 List 的防禦行為（如本次 ADPSITUAT-4799）
- Controller VR 驗證邏輯（不啟動 Spring context，直接呼叫 controller method）

## 測試骨架

```java
// AC-01: messageEvents 未設值時不拋 NPE
@Test
@DisplayName("AC-01: should not throw NullPointerException when messageEvents is not set")
void ac01_methodName_condition() {
    // Given
    SomeDto dto = new SomeDto();
    // dto.setMessageEvents 未呼叫 → 依欄位預設值

    // When / Then
    assertThatCode(() -> service.process(dto))
        .doesNotThrowAnyException();
}
```

## 建議模式

- `@Mock` 只 mock 直接協作物件，不 mock 整個 Spring context
- `when(...).thenReturn(...)` stub 只補「執行路徑上會用到的」，不過度 stub
- AssertJ 優先（`assertThat`、`assertThatCode`、`assertThatThrownBy`）
- 邊界值：null、空 List、最大 / 最小值各準備一個 case
- 用 `@Builder` 建測試資料時，初始化所有會被使用的欄位，避免後續 NPE 遮掩測試意圖
