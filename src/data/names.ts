const FIRST_NAMES = [
  'James', 'Marcus', 'Oliver', 'Daniel', 'Lucas', 'Ethan', 'Noah', 'Liam', 'Kai', 'Andre',
  'Carlos', 'Diego', 'Pablo', 'Sergio', 'Marco', 'Luca', 'Hugo', 'Felix', 'Oscar', 'Leo',
  'Yuki', 'Kenji', 'Sadio', 'Amara', 'Kofi', 'Tariq', 'Ivan', 'Dmitri', 'Erik', 'Lars',
  'Mohamed', 'Omar', 'Youssef', 'Rashid', 'Tomás', 'Rafael', 'Bruno', 'Thiago', 'Mateo', 'Enzo',
  'Jack', 'Harry', 'Charlie', 'George', 'William', 'Thomas', 'Alexander', 'Benjamin', 'Samuel', 'Joseph',
  'Antoine', 'Kylian', 'Ousmane', 'N\'Golo', 'Karim', 'Paulo', 'João', 'Diogo', 'Bernardo', 'Rúben',
  'Lautaro', 'Ángel', 'Giovani', 'Nicolás', 'Alejandro', 'Andrés', 'Juan', 'Felipe', 'Cristian', 'Emiliano',
  'Takeshi', 'Shinji', 'Takumi', 'Daichi', 'Haruki', 'Kwame', 'Abdul', 'Ibrahim', 'Moussa', 'Idrissa',
  'Viktor', 'Andrei', 'Sergei', 'Nikolai', 'Pavel', 'Stefan', 'Luka', 'Marko', 'Filip', 'Dusan',
  'Christian', 'Mikkel', 'Emil', 'Frederik', 'Piotr', 'Robert', 'Jakub', 'Bartosz', 'Szymon', 'Kacper',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Rodriguez', 'Martinez', 'Johnson', 'Williams', 'Brown', 'Taylor', 'Müller', 'Schmidt',
  'Rossi', 'Bianchi', 'Dubois', 'Laurent', 'García', 'López', 'Fernández', 'Torres', 'Nakamura', 'Tanaka',
  'Okafor', 'Diallo', 'Mensah', 'Hassan', 'Petrov', 'Novak', 'Andersen', 'Johansson', 'Ali', 'Rahman',
  'Costa', 'Oliveira', 'Pereira', 'Almeida', 'Kovac', 'Horvat', 'Svoboda', 'Zielinski', 'Kowalski', 'Nowak',
  'Smith', 'Jones', 'Walker', 'Wright', 'Robinson', 'Clarke', 'Hughes', 'Bennett', 'Cooper', 'Richardson',
  'Griezmann', 'Mbappé', 'Dembélé', 'Kanté', 'Benzema', 'Neves', 'Félix', 'Jota', 'Silva', 'Dias',
  'Messi', 'Di María', 'Lo Celso', 'Otamendi', 'De Paul', 'Iniesta', 'Villa', 'Ramos', 'Pedri', 'Gavi',
  'Honda', 'Kagawa', 'Minamino', 'Tomiyasu', 'Endo', 'Partey', 'Koulibaly', 'Mané', 'Salah', 'Gueye',
  'Modric', 'Perisic', 'Brozovic', 'Vlasic', 'Kramaric', 'Lewandowski', 'Szczesny', 'Milik', 'Piatek', 'Glik',
  'Eriksen', 'Hojbjerg', 'Schmeichel', 'Haaland', 'Odegaard', 'Berg', 'Isak', 'Kulusevski', 'Svanberg', 'Nilsson',
];

const NATIONALITIES = [
  'England', 'Brazil', 'Argentina', 'France', 'Germany', 'Spain', 'Italy', 'Portugal',
  'Netherlands', 'Belgium', 'Croatia', 'Japan', 'Nigeria', 'Senegal', 'Morocco', 'Egypt',
  'Denmark', 'Sweden', 'Norway', 'Poland', 'Colombia', 'Uruguay', 'Mexico', 'USA',
];

const TEAM_NAMES = [
  'Northgate United', 'Riverside FC', 'Oakwood City', 'Hillcrest Rovers', 'Harbour Athletic',
  'Kingsford Town', 'Meadowbrook FC', 'Stonebridge United', 'Redcliff Wanderers', 'Ashfield City',
  'Thornbury Rovers', 'Westhaven FC', 'Ironvale United', 'Lakeside Athletic', 'Copperfield Town',
  'Greystone City', 'Fairview Rovers', 'Blackmoor FC', 'Silverdale United', 'Whitmore Athletic',
];

const CITIES = [
  'Northgate', 'Riverside', 'Oakwood', 'Hillcrest', 'Harbourside',
  'Kingsford', 'Meadowbrook', 'Stonebridge', 'Redcliff', 'Ashfield',
  'Thornbury', 'Westhaven', 'Ironvale', 'Lakeside', 'Copperfield',
  'Greystone', 'Fairview', 'Blackmoor', 'Silverdale', 'Whitmore',
];

const STADIUMS = [
  'The Fortress', 'Riverside Park', 'Oakwood Arena', 'Hillcrest Ground', 'Harbour Stadium',
  'Kingsford Park', 'Meadow Lane', 'Stonebridge Stadium', 'Redcliff Field', 'Ashfield Park',
  'Thornbury Ground', 'Westhaven Arena', 'Ironvale Stadium', 'Lakeside Park', 'Copperfield Ground',
  'Greystone Arena', 'Fairview Park', 'Blackmoor Stadium', 'Silverdale Field', 'Whitmore Park',
];

const TEAM_COLORS: Array<{ primary: string; secondary: string }> = [
  { primary: '#e63946', secondary: '#ffffff' },
  { primary: '#457b9d', secondary: '#f1faee' },
  { primary: '#2d6a4f', secondary: '#ffffff' },
  { primary: '#e76f51', secondary: '#264653' },
  { primary: '#6a4c93', secondary: '#ffffff' },
  { primary: '#1d3557', secondary: '#e63946' },
  { primary: '#f4a261', secondary: '#264653' },
  { primary: '#264653', secondary: '#2a9d8f' },
  { primary: '#d62828', secondary: '#003049' },
  { primary: '#023e8a', secondary: '#ffffff' },
  { primary: '#606c38', secondary: '#fefae0' },
  { primary: '#bc6c25', secondary: '#ffffff' },
  { primary: '#3d405b', secondary: '#e07a5f' },
  { primary: '#0077b6', secondary: '#caf0f8' },
  { primary: '#9b2226', secondary: '#ee9b00' },
  { primary: '#005f73', secondary: '#94d2bd' },
  { primary: '#582f0e', secondary: '#a68a64' },
  { primary: '#10002b', secondary: '#e0aaff' },
  { primary: '#004e64', secondary: '#25a18e' },
  { primary: '#7f5539', secondary: '#ddb892' },
];

export { FIRST_NAMES, LAST_NAMES, NATIONALITIES, TEAM_NAMES, CITIES, STADIUMS, TEAM_COLORS };
