# 🚀 GitHub-Skill-icons

**GitHub-Skill-icons** is a simple API project that allows you to dynamically generate skill icons for use in GitHub profiles, READMEs, and other documentation. Inspired by [skillicons.dev](https://skillicons.dev), this project makes it easy to showcase your tech stack with customizable and visually appealing icons.

---

## ✨ Features

- **REST API for Skill Icons**: Easily fetch icons using query parameters.
- **Customizable Output**: Choose the number of icons per line and theme (dark or light).
- **Easy Integration**: Perfect for GitHub READMEs, portfolio sites, and dashboards.
- **Fast & Serverless**: Powered by Vercel for instant responses.

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pranesh-2005/GitHub-Skill-icons.git
   cd GitHub-Skill-icons
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   > Requires [Node.js](https://nodejs.org/) 16+.

3. **Deploy (optional)**
   - This project is optimized for [Vercel](https://vercel.com/).  
     Simply import into Vercel, and you're done!

---

## 🛠️ Usage

The main API endpoint is `/api/icons`.  
You can customize the output using query parameters:

| Parameter   | Description                                  | Example                       |
|-------------|----------------------------------------------|-------------------------------|
| `i`         | Comma-separated list of skills/icons         | `i=react,nodejs,typescript`   |
| `perline`   | Number of icons per line (default: 15)       | `perline=5`                   |
| `theme`     | Card theme: `dark` or `light` (default: dark)| `theme=light`                 |

**Example Request:**
```http
GET /api/icons?i=react,nodejs,typescript&perline=5&theme=light
```

**Sample Vercel configuration (`vercel.json`):**
```json
{
  "routes": [
    {
      "src": "/api/icons",
      "dest": "/api/icons.js"
    }
  ]
}
```

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!  
Feel free to check [issues page](../../issues) or submit a pull request.

**To contribute:**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a new Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> _Made with ❤️ for the open source community._

## License
This project is licensed under the **MIT** License.

---
🔗 GitHub Repo: https://github.com/Pranesh-2005/GitHub-Skill-icons