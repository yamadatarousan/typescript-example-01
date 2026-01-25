# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - paragraph [ref=e6]: Phase 5 Auth
    - heading "私だけのTODO空間に ログインする。" [level=1] [ref=e7]:
      - text: 私だけのTODO空間に
      - generic [ref=e8]: ログインする。
    - paragraph [ref=e9]: シンプルな認証だけど、API・トークン・権限の流れを学べる実装。 ログインからデータ取得までの一連を体験しよう。
    - generic [ref=e10]:
      - generic [ref=e13]: JWTで安全に認証
      - generic [ref=e16]: TODOはユーザーごとに分離
      - generic [ref=e19]: 最小構成で学ぶログイン体験
  - generic [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e23]:
        - paragraph [ref=e24]: Welcome
        - heading "Login" [level=2] [ref=e25]
      - generic [ref=e26]:
        - button "Login" [ref=e27] [cursor=pointer]
        - button "Sign up" [ref=e28] [cursor=pointer]
    - generic [ref=e29]:
      - generic [ref=e30]:
        - text: Email
        - textbox "Email" [ref=e31]:
          - /placeholder: you@example.com
          - text: user@example.com
      - generic [ref=e32]:
        - text: Password
        - textbox "Password" [ref=e33]:
          - /placeholder: minimum 8 characters
          - text: password123
      - generic [ref=e34]: Invalid credentials.
      - button "Login" [ref=e35] [cursor=pointer]
    - paragraph [ref=e36]: This is a practice screen. Use any email and an 8+ character password.
```