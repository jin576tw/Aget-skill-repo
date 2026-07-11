# MockMvc / API Integration Test Patterns（Java）

適用：Step 7 後端 API endpoint 改動 — 驗證 HTTP 層行為（狀態碼、回應 body、錯誤格式）。

## 使用時機

- 改動涉及 `@RestController`、`@PostMapping`、`@PutMapping`、`@DeleteMapping`
- DTO / Service 改動影響 HTTP 回應碼或 body 結構
- Bug fix 類型：修復前 NPE → 500，修復後應回 2xx

## 兩種模式選擇

| 模式 | 適用 | 啟動成本 |
|------|------|---------|
| `@WebMvcTest` | 只測 Web 層，Service 以 `@MockitoBean` 替換 | 快，只啟動 MVC slice |
| `@SpringBootTest(webEnvironment = MOCK)` | 測完整 Spring context（含 Service 實作） | 慢，但驗證更完整 |

**原則**：Bug fix 驗證優先用 `@WebMvcTest`；若涉及多層 service 互動才升級到 `@SpringBootTest`。

⚠️ **先確認專案測試風格**：部分專案（如 adp-policy）所有 `@SpringBootTest` 均 `@Disabled`（需完整 DB/Redis 環境），單元測試統一純 Mockito——這類專案**不應新增**未 `@Disabled` 的 `@SpringBootTest` 測試。動工前先看既有測試目錄的慣例。

## `@MockitoBean` 取代 `@MockBean`（Spring Boot 3.4+）

- `@MockBean`（spring-boot-test）自 Spring Boot 3.4 起 deprecated，正式替代品為 `@MockitoBean`（`org.springframework.test.context.bean.override.mockito.MockitoBean`）；3.4 下用舊註解仍可編譯但會警告，之後版本可能移除。
- 標準組合：`@WebMvcTest(XxxController.class)` + `@MockitoBean XxxService service`。
- `@WebMvcTest` 不啟動完整 ApplicationContext：Controller 直接注入的每個 Service 都要逐一 `@MockitoBean`，否則 context 載入失敗（`No qualifying bean of type 'XxxService'`）；但只需 mock **直接注入 Controller 的**，Service 內部再注入的下游不用。有 security filter 時連 `JwtService` 等也要 mock。

## @WebMvcTest 骨架

```java
@WebMvcTest(FooController.class)
class FooControllerIT {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    FooService fooService;

    @Autowired
    ObjectMapper objectMapper;

    // IT-01: 送出缺少必填欄位的 request → 應回 200（不 NPE 500）
    @Test
    @DisplayName("IT-01: should return 200 when messageEvents is absent from request body")
    void it01_replaceUw_shouldReturn200_whenMessageEventsAbsent() throws Exception {
        // Given: body 未包含 messageEvents 欄位
        String requestBody = """
                {
                  "items": []
                }
                """;

        when(fooService.process(any(), any())).thenReturn(someResult());

        // When / Then
        mockMvc.perform(put("/gi/nb/policies/{policyId}/insured/replace/uw", 843L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk());
    }
}
```

## @SpringBootTest 骨架

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class FooControllerFullIT {

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("IT-01: ...")
    void it01_...) throws Exception {
        mockMvc.perform(put("/path/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.field").value("expected"));
    }
}
```

## 測試命名規則

- 類別：`{Controller}IT.java`（Integration Test 後綴，非 `Test`，區別 unit test）
- 位置：IT 類與 Controller 同包（如 `src/test/java/.../http/`）
- 方法：`it{NN}_{methodName}_{scenario}`
- `@DisplayName`：`IT-XX: should {result} when {condition}`
- `// IT-XX` 註解同 AC-tagging 規則

## Guardrails

- `@MockitoBean` 只 mock 直接依賴的 service，不 mock repository（除非用 `@DataJpaTest`）
- 驗證 HTTP status + 關鍵 response body field；不窮舉所有欄位
- 每個 IT case 對應 spec 的一條 AC 或一個 bug scenario
