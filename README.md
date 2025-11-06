# 🏃 Running Well

Um aplicativo mobile moderno e completo para rastreamento de corridas desenvolvido com React Native e Expo.

## 📱 Sobre o Projeto

Running Well é um aplicativo de fitness focado em corrida que permite aos usuários rastrear suas corridas em tempo real usando GPS, definir metas de corrida (diárias, semanais ou mensais), acompanhar estatísticas detalhadas e conquistar achievements ao completar objetivos.

### ✨ Funcionalidades Principais

- **Rastreamento GPS em Tempo Real**
  - Mapas interativos com Google Maps
  - Seguimento automático da localização durante a corrida
  - Rastreamento contínuo em segundo plano (background)
  - Funciona mesmo com tela bloqueada ou app em background
  - Foreground service no Android para rastreamento confiável
  - Visualização da rota percorrida em tempo real
  - Marcadores de início e fim da corrida
  - Placeholder profissional durante inicialização do GPS
  - Filtragem inteligente de ruído GPS e detecção de saltos

- **Estatísticas Detalhadas**
  - Distância total percorrida
  - Tempo de corrida
  - Ritmo médio (min/km)
  - Velocidade média (km/h)
  - Estatísticas semanais e mensais
  - Melhor corrida registrada

- **Sistema de Metas**
  - Metas diárias, semanais ou mensais
  - Acompanhamento visual de progresso
  - Notificações ao completar metas
  - Reset automático ao criar nova meta

- **Sistema de Conquistas**
  - Achievements desbloqueados ao completar metas
  - Histórico de conquistas
  - Visualização de achievements por tipo

- **Histórico de Corridas**
  - Lista completa de todas as corridas
  - Visualização detalhada de cada corrida
  - Mapa da rota percorrida
  - Estatísticas individuais por corrida
  - Opção de deletar corridas

- **Perfil do Usuário**
  - Configuração de parâmetros pessoais (nome, peso, altura, idade, gênero)
  - Interface totalmente em português
  - Configuração de metas
  - Visualização de conquistas

- **Interface Moderna**
  - Suporte a tema claro/escuro automático
  - Design responsivo e intuitivo
  - Animações suaves
  - Placeholder profissional durante carregamento do GPS
  - Navegação livre durante corrida ativa (rastreamento continua em background)
  - Banner de corrida ativa na tela inicial
  - Layout otimizado para evitar sobreposição com botões do sistema

## 🛠️ Tecnologias Utilizadas

### Core
- **React Native** 0.81.5
- **Expo** ~54.0.22
- **React** 19.1.0
- **Expo Router** ~6.0.14 (Navegação baseada em arquivos)

### Mapas e Localização
- **react-native-maps** 1.20.1
- **expo-location** ~19.0.7

### Estilização
- **NativeWind** ^4.1.23 (Tailwind CSS para React Native)
- **Tailwind CSS** ^3.4.17

### Armazenamento
- **@react-native-async-storage/async-storage** 2.2.0

### Navegação
- **@react-navigation/native** ^7.1.8
- **@react-navigation/bottom-tabs** ^7.4.0

### Outras Bibliotecas
- **expo-haptics** ~15.0.7 (Feedback tátil)
- **react-native-reanimated** ~4.1.1 (Animações)
- **react-native-gesture-handler** ~2.28.0 (Gestos)
- **@expo/vector-icons** ^15.0.3 (Ícones)

## 📁 Estrutura do Projeto

```
running_well/
├── app/                          # Rotas da aplicação (Expo Router)
│   ├── (tabs)/                   # Navegação por abas
│   │   ├── index.jsx            # Tela inicial (Home)
│   │   ├── history.jsx           # Histórico de corridas
│   │   ├── stats.jsx            # Estatísticas
│   │   ├── profile.jsx          # Perfil do usuário
│   │   └── _layout.jsx          # Layout das abas
│   ├── current-run.jsx          # Tela de corrida ativa
│   ├── run-details.jsx         # Detalhes de uma corrida
│   ├── goal-settings.jsx       # Configuração de metas
│   ├── personal-parameters.jsx  # Parâmetros pessoais
│   ├── achievements.jsx        # Conquistas
│   └── _layout.jsx             # Layout raiz
├── components/                   # Componentes reutilizáveis
│   ├── GoogleMapView.jsx        # Componente do mapa
│   └── ui/                      # Componentes de UI
├── context/                      # Contextos React (Estado global)
│   ├── RunContext.jsx          # Contexto de corridas
│   ├── SettingsContext.jsx     # Contexto de configurações
│   ├── AchievementsContext.jsx # Contexto de conquistas
│   └── LocationTrackingProvider.jsx # Contexto de rastreamento GPS (global)
├── hooks/                        # Hooks customizados
│   ├── useLocationTracking.jsx # Hook que consome LocationTrackingProvider
│   └── use-color-scheme.jsx    # Hook de tema
├── assets/                       # Recursos estáticos
│   └── images/                 # Imagens do app
├── app.json                     # Configuração do Expo
├── eas.json                     # Configuração do EAS Build
└── package.json                 # Dependências do projeto
```

## 🚀 Como Começar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta no Expo (opcional, para builds)
- Google Maps API Key (para mapas)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Tosi10/Running_Well.git
cd Running_Well
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a Google Maps API Key:
   - Obtenha uma chave em [Google Cloud Console](https://console.cloud.google.com/)
   - Edite `app.json` e adicione sua chave:
   ```json
   "ios": {
     "config": {
       "googleMapsApiKey": "SUA_CHAVE_AQUI"
     }
   },
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "SUA_CHAVE_AQUI"
       }
     }
   }
   ```

4. Inicie o servidor de desenvolvimento:
```bash
npx expo start
```

### Executando em Dispositivos

#### Android
```bash
# Com emulador Android
npx expo start --android

# Ou escaneie o QR code com Expo Go
```

#### iOS
```bash
# Com simulador iOS (apenas macOS)
npx expo start --ios

# Ou escaneie o QR code com Expo Go
```

## 📦 Build e Deploy

### Desenvolvimento

Para testar em desenvolvimento:
```bash
npx expo start
```

### Build de Produção

#### Android (APK)
```bash
# Build preview
npx eas build --platform android --profile preview

# Build production
npx eas build --platform android --profile production
```

#### iOS (TestFlight)
```bash
# Build production
npx eas build --platform ios --profile production

# Submit para TestFlight
npx eas submit --platform ios --profile production
```

### Configuração do EAS Build

O projeto está configurado com EAS Build. Certifique-se de ter:
- Conta Expo configurada
- EAS CLI instalado (`npm install -g eas-cli`)
- Login feito (`eas login`)

## 🔧 Configurações

### Permissões

O app requer as seguintes permissões:

#### iOS
- **NSLocationWhenInUseUsageDescription**: Localização durante o uso do app
- **NSLocationAlwaysAndWhenInUseUsageDescription**: Localização sempre (incluindo background)
- **NSLocationAlwaysUsageDescription**: Localização em background
- **UIBackgroundModes**: `["location"]` - Permite rastreamento em segundo plano

#### Android
- **ACCESS_FINE_LOCATION**: Localização precisa (GPS)
- **ACCESS_COARSE_LOCATION**: Localização aproximada
- **ACCESS_BACKGROUND_LOCATION**: Localização em segundo plano
- **FOREGROUND_SERVICE**: Serviço em primeiro plano
- **FOREGROUND_SERVICE_LOCATION**: Serviço de localização em primeiro plano

### Bundle IDs

- **iOS**: `com.runningwell.app`
- **Android**: `com.runningwell.app`

### Configurações de Rastreamento GPS

O app utiliza configurações otimizadas para rastreamento preciso:

- **Precisão**: `Location.Accuracy.BestForNavigation` - Máxima precisão para navegação
- **Intervalo de Tempo**: 1000ms (1 segundo) - Atualizações frequentes
- **Intervalo de Distância**: 1 metro - Novo ponto a cada metro percorrido
- **Filtragem de Ruído**: 
  - Mínimo: 0.5 metros (ignora micro-movimentos)
  - Máximo: 100 metros (ignora saltos de GPS)
- **Foreground Service (Android)**: Notificação persistente durante rastreamento

## 🎨 Funcionalidades Detalhadas

### Rastreamento de Corrida

- **Início/Pausa**: Controle total sobre o rastreamento
- **Rastreamento em Background**: Continua funcionando mesmo quando:
  - O app está em segundo plano
  - A tela está bloqueada
  - O usuário navega para outras telas do app
- **Parada**: Opção de zerar corrida com confirmação (só funciona se houver corrida ativa)
- **Finalização**: Salva corrida no histórico com todos os dados
- **Precisão**: 
  - Filtragem inteligente de ruído GPS
  - Detecção e ignorância de saltos de GPS
  - Cálculo preciso de distância usando fórmula de Haversine
- **Estado Persistente**: O estado da corrida é mantido globalmente, permitindo navegação livre

### Sistema de Metas

- **Tipos**: Diária, Semanal, Mensal
- **Progresso Visual**: Barra de progresso em tempo real
- **Reset Inteligente**: Ao criar nova meta, conta apenas corridas após a criação
- **Conquistas**: Desbloqueio automático ao completar metas

### Estatísticas

- **Total**: Distância total, tempo total, número de corridas
- **Semanal**: Estatísticas da semana atual
- **Mensal**: Estatísticas do mês atual
- **Melhor Corrida**: Maior distância registrada

## 🆕 Melhorias Recentes

### Versão Atual

- ✅ **Rastreamento GPS Otimizado**
  - Refatoração completa do sistema de rastreamento para contexto global
  - Suporte completo para rastreamento em background (iOS e Android)
  - Foreground service no Android para rastreamento confiável
  - Filtragem aprimorada de ruído GPS
  - Otimização de bateria mantendo precisão

- ✅ **Melhorias de UX/UI**
  - Interface totalmente traduzida para português
  - Placeholder profissional durante carregamento do GPS
  - Banner de corrida ativa na tela inicial
  - Navegação livre durante corrida (rastreamento continua)
  - Layout otimizado para diferentes tamanhos de tela
  - Ajuste automático de zoom no mapa para visualização de rotas salvas

- ✅ **Sistema de Conquistas**
  - Desbloqueio automático ao completar metas
  - Histórico completo de conquistas
  - Timestamps de desbloqueio

- ✅ **Correções de Bugs**
  - Correção do toggle de meta em goal-settings
  - Reset correto de progresso ao criar nova meta
  - Botão de parar só funciona quando há corrida ativa
  - Limpeza de permissões duplicadas no app.json

## 🐛 Troubleshooting

### Problemas comuns

**GPS não funciona ou para após alguns minutos:**
- Verifique se as permissões de localização estão habilitadas
- No Android, certifique-se de permitir "Localização em segundo plano"
- No iOS, permita "Sempre" quando solicitado
- Teste em dispositivo físico (GPS não funciona bem em emuladores)
- Verifique se a localização está ativada no dispositivo
- Reinicie o app se o rastreamento parar

**Mapa não carrega ou demora muito:**
- Verifique se a Google Maps API Key está configurada corretamente
- Confirme que a chave tem permissões para Maps SDK (Android e iOS)
- Verifique sua conexão com a internet
- Aguarde alguns segundos na primeira inicialização (GPS precisa de tempo)

**Rastreamento para quando app vai para background:**
- No Android: Verifique se a permissão de "Localização em segundo plano" foi concedida
- No iOS: Certifique-se de ter selecionado "Sempre" nas configurações de localização
- Verifique se o foreground service está funcionando (notificação deve aparecer no Android)

**Build falha:**
- Execute `npx expo install --fix` para corrigir dependências
- Limpe o cache: `npx expo start -c`
- Verifique se todas as configurações no `app.json` estão corretas
- Para iOS: Certifique-se de que o build number foi incrementado

## 📝 Licença

Este projeto é privado e proprietário.

## 👥 Contribuindo

Este é um projeto pessoal. Para sugestões ou problemas, abra uma issue no repositório.

## 📞 Contato

Para dúvidas ou suporte, entre em contato através do repositório GitHub.

---

**Desenvolvido com ❤️ usando React Native e Expo**
