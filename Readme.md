# 🌌 Orion MCP - Um Framework Avançado para Orquestração de Agentes de IA

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green?style=for-the-badge&logo=fastapi)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-orange?style=for-the-badge&logo=rabbitmq)
![Redis](https://img.shields.io/badge/Redis-7.2-red?style=for-the-badge&logo=redis)

> Este projeto foi desenvolvido para ser um sistema poderoso e complexo, ideal para um portfólio de engenharia de software e IA. Ele demonstra o domínio sobre arquiteturas de microsserviços, sistemas assíncronos e a integração com modelos de linguagem de larga escala (LLMs).

---

## 🚀 O que é o Orion MCP?

Orion MCP (Model Context Protocol) é mais do que um simples "chatbot". É uma **plataforma completa para construir, gerenciar e orquestrar uma rede de agentes de IA especializados**.

Imagine que você tem um objetivo complexo, como "analisar os dados de um site, escrever um relatório e enviá-lo por email". Em vez de fazer tudo manualmente, você entrega esse objetivo ao **Orquestrador do Orion**. Ele, por sua vez, usa uma IA para criar um plano de múltiplos passos e delega cada passo para o agente certo:

1.  **Agente de Análise Web**: Extrai os dados.
2.  **Agente de Geração de Texto**: Escreve o relatório.
3.  **Agente de Comunicação**: Envia o email.

Este projeto implementa a espinha dorsal de um sistema como esse, focando em robustez, escalabilidade e inteligência.

---

## ✨ Funcionalidades Principais

*   **🧠 Orquestrador Inteligente**: Um endpoint de API que recebe um objetivo em linguagem natural e utiliza um LLM (Groq/Llama3) para criar um plano de execução com múltiplos passos.
*   **🤖 Agentes de IA Especializados**: Workers independentes com capacidades distintas:
    *   `code_generation`: Gera código a partir de prompts.
    *   `web_search`: Realiza scraping de informações de páginas web.
    *   `generic_text_processing`: Executa tarefas simples de manipulação de texto.
*   **📨 Arquitetura Orientada a Eventos**: Utiliza **RabbitMQ** como um Message Broker para delegar tarefas de forma assíncrona. Isso garante que o sistema seja escalável e resiliente; o manager não precisa saber quais ou quantos agentes estão online.
*   **⚡ Backend de Resultados Ultrarrápido**: Usa **Redis** para armazenar o status e o resultado das tarefas, permitindo que o usuário consulte o progresso de um trabalho de forma quase instantânea.
*   ** FastAPI Robusta**: Uma API moderna, rápida e com documentação interativa automática (via Swagger UI) para todos os endpoints.
*   **📝 Protocolo Definido**: Um "Model Context Protocol" claro, usando Pydantic, que define como os diferentes componentes do sistema se comunicam.

---

## 🛠️ Arquitetura e Tecnologias

O sistema é dividido em componentes desacoplados que se comunicam através de APIs e filas de mensagens.

**Pilha Tecnológica:**
*   **Linguagem**: Python 3.11+
*   **Framework da API**: FastAPI
*   **Fila de Mensagens**: RabbitMQ
*   **Banco de Dados de Resultados**: Redis
*   **Modelos de IA**: Groq (Llama 3 8B) via `litellm`
*   **Validação de Dados**: Pydantic
*   **Web Scraping**: BeautifulSoup4 & Requests
*   **Servidor ASGI**: Uvicorn

---

## 🏁 Como Começar

### Pré-requisitos
Antes de iniciar, garanta que você tem os seguintes serviços instalados e rodando em sua máquina:
1.  **Python 3.11+**
2.  **RabbitMQ**: [Guia de Instalação para Windows](https://www.rabbitmq.com/install-windows.html) (Não esqueça de instalar a dependência Erlang primeiro).
3.  **Redis**: [Guia de Instalação para Windows (MicrosoftArchive)](https://github.com/microsoftarchive/redis/releases).
4.  **Uma API Key da Groq**: Obtenha gratuitamente em [console.groq.com](https://console.groq.com/keys).

### Configuração
1.  Clone este repositório.
2.  Instale as dependências Python para ambos os serviços:
    ```bash
    # A partir da pasta raiz do projeto
    pip install -r agent_manager/requirements.txt
    pip install -r agent_worker/requirements.txt
    ```
3.  **Configure as API Keys:**
    *   Abra o arquivo `agent_manager/main.py` e insira sua API Key da Groq na linha `os.environ["GROQ_API_KEY"] = "SUA_API_KEY..."`.
    *   Faça o mesmo no arquivo `agent_worker/main.py`.

### Execução
Abra dois terminais na pasta raiz do projeto.

**Terminal 1 - Iniciar o Manager:**
```bash
uvicorn agent_manager.main:app --reload
```

**Terminal 2 - Iniciar o Worker:**
```bash
python -m agent_worker.main
```

Seu sistema agora está totalmente operacional!

---

## 🕹️ Como Usar a API

A maneira mais fácil de interagir com o sistema é através da **documentação interativa** gerada pelo FastAPI.

**Acesse: [http://localhost:8000/docs](http://localhost:8000/docs)**

### Exemplo: Orquestrando um Objetivo Complexo

Este é o principal endpoint do sistema. Ele permite que você dê um objetivo em linguagem natural.

1.  Vá para o endpoint `POST /api/v1/orchestrate`.
2.  Clique em "Try it out".
3.  No corpo da requisição, insira seu objetivo:
    ```json
    {
      "goal": "Escreva uma função em Python que inverte uma string e, em seguida, me dê um exemplo de como usá-la com o texto 'Orion MCP'."
    }
    ```
4.  Clique em **Execute**.

O sistema irá usar a IA para criar um plano com dois passos (`code_generation` e `generic_text_processing`), executá-los em sequência e retornar o resultado de ambos.

---

## 🔮 Próximos Passos e Melhorias

Este projeto é uma fundação sólida. Para evoluí-lo ainda mais, os próximos passos poderiam incluir:
*   **Frontend em React/Vue**: Uma interface de usuário para visualizar os agentes, disparar tarefas e ver os resultados em tempo real.
*   **Banco de Dados Persistente**: Usar PostgreSQL para armazenar o histórico de tarefas e resultados a longo prazo.
*   **Mais Agentes**: Criar novos agentes com outras capacidades (ex: interagir com o sistema de arquivos, enviar emails, etc.).
*   **Planos de Execução em Paralelo**: Modificar o orquestrador para identificar tarefas que podem ser executadas ao mesmo tempo, otimizando o tempo de execução.