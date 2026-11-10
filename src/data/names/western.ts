/** 欧米・北欧・ファンタジーの名前リスト。マルコフ連鎖の学習にも使う */
import { words } from './parse';

export interface NameLists {
  male: string[];
  female: string[];
  family: string[];
}

export const ENGLISH: NameLists = {
  male: words(`James John Robert Michael William David Richard Joseph Thomas Charles Christopher Daniel Matthew Anthony
Mark Paul Steven Andrew Joshua Kevin Brian George Edward Ronald Timothy Jason Jeffrey Ryan Jacob Gary Nicholas Eric
Jonathan Stephen Larry Justin Scott Benjamin Samuel Gregory Alexander Patrick Jack Henry Oliver Harry Charlie Oscar
Arthur Leo Ethan Liam Noah Lucas Mason Logan Owen Nathan Dylan Isaac Adam Luke Elliot Theodore Frederick`),
  female: words(`Mary Patricia Jennifer Linda Elizabeth Barbara Susan Jessica Sarah Karen Nancy Lisa Margaret Betty Sandra
Ashley Emily Donna Michelle Carol Amanda Melissa Deborah Stephanie Rebecca Laura Sharon Cynthia Kathleen Amy Shirley
Angela Helen Anna Brenda Emma Olivia Ava Sophia Isabella Charlotte Amelia Harper Evelyn Abigail Ella Grace Chloe Lily
Hannah Alice Ruby Florence Isla Poppy Rosie Holly Lucy Eleanor Victoria`),
  family: words(`Smith Johnson Williams Brown Jones Miller Davis Wilson Anderson Taylor Thomas Moore Martin Jackson Thompson
White Harris Clark Lewis Robinson Walker Young Allen King Wright Scott Hill Green Adams Baker Nelson Carter Mitchell
Roberts Turner Phillips Campbell Parker Evans Edwards Collins Stewart Morris Murphy Cook Rogers Morgan Cooper Peterson
Bailey Reed Kelly Howard Ward Cox Richardson Wood Watson Brooks Bennett Gray Hughes Price Sanders Fisher Ellis Hunt
Palmer Wells Webb Hawkins Fletcher Chapman`),
};

export const GERMAN: NameLists = {
  male: words(`Lukas Leon Finn Jonas Paul Felix Elias Maximilian Ben Luis Noah Henry Emil Anton Theo Jakob Moritz Julian
Niklas Tim Jan Tobias Florian Sebastian Stefan Andreas Michael Thomas Wolfgang Klaus Jürgen Dieter Günter Helmut Werner
Karl Friedrich Heinrich Hans Otto Ludwig Matthias Benedikt Konrad Rainer Uwe Dirk Sven Lars Torsten`),
  female: words(`Emma Mia Hannah Sophia Lina Lea Marie Clara Ella Leni Mila Emilia Johanna Lena Anna Laura Lisa Julia Sarah
Katharina Sabine Petra Ursula Monika Gisela Ingrid Helga Renate Brigitte Heike Claudia Susanne Andrea Birgit Anke Silke
Greta Frieda Ida Charlotte Mathilde Luise Elisabeth Margarete Annika Franziska Theresa Magdalena Wiebke`),
  family: words(`Müller Schmidt Schneider Fischer Weber Meyer Wagner Becker Schulz Hoffmann Schäfer Koch Bauer Richter Klein
Wolf Schröder Neumann Schwarz Zimmermann Braun Krüger Hofmann Hartmann Lange Schmitt Werner Schmitz Krause Meier Lehmann
Schmid Schulze Maier Köhler Herrmann König Walter Mayer Huber Kaiser Fuchs Peters Lang Scholz Möller Weiß Jung Hahn
Schubert Vogel Friedrich Keller Günther Frank Berger Winkler Roth Beck Lorenz Baumann Franke Albrecht Schuster Simon
Böhm Winter Kraus Schumacher Krämer Vogt Stein Jäger Sommer Groß Seidel Brandt Haas`),
};

export const FRENCH: NameLists = {
  male: words(`Gabriel Louis Raphaël Jules Adam Lucas Léo Hugo Arthur Nathan Liam Ethan Paul Sacha Mathis Gabin Théo Noé
Aaron Victor Martin Antoine Baptiste Clément Maxime Alexandre Nicolas Julien Pierre Jean Philippe Michel Alain Bernard
Christophe François Guillaume Laurent Olivier Sébastien Thierry Vincent Yves Henri Étienne Rémi Mathieu Benoît Didier
Jacques`),
  female: words(`Jade Louise Emma Alice Ambre Lina Rose Chloé Mia Léa Anna Inès Léna Juliette Manon Camille Zoé Lou Agathe
Margaux Sarah Élise Céline Nathalie Isabelle Sylvie Catherine Françoise Monique Valérie Sophie Sandrine Aurélie Émilie
Julie Pauline Mathilde Clémence Océane Noémie Charlotte Héloïse Amélie Brigitte Danielle Geneviève Madeleine Marguerite
Odette Solène`),
  family: words(`Martin Bernard Thomas Petit Robert Richard Durand Dubois Moreau Laurent Simon Michel Lefebvre Leroy Roux
David Bertrand Morel Fournier Girard Bonnet Dupont Lambert Fontaine Rousseau Vincent Lefèvre Faure André Mercier Blanc
Guérin Boyer Garnier Chevalier François Legrand Gauthier Perrin Robin Clément Morin Nicolas Henry Roussel Mathieu
Gautier Masson Marchand Duval Denis Dumont Lemaire Noël Dufour Meunier Brun Blanchard Giraud Joly Rivière Lucas Brunet
Gaillard Barbier Arnaud Gérard Roche Renard Roy Leroux Colin Vidal Caron Picard`),
};

export const NORDIC: NameLists = {
  male: words(`Erik Lars Anders Johan Nils Karl Olof Per Magnus Sven Gustav Axel Oskar Lucas William Elias Hugo Liam
Noah Oliver Emil Filip Viktor Leo Mikael Henrik Fredrik Jonas Mats Björn Gunnar Leif Ragnar Torbjörn Ingvar Stig Håkan
Kjell Arne Bjarne Harald Sigurd Odd Rune Jens Søren Mads Rasmus Kasper Aksel Eino Mikko Juha Jukka Timo Matti`),
  female: words(`Anna Eva Maria Karin Kristina Lena Sara Emma Ingrid Astrid Elsa Alice Maja Ebba Saga Freja Wilma Ella
Alma Signe Sigrid Linnea Elin Hanna Ida Ingeborg Solveig Gunhild Ragnhild Liv Siri Tove Birgitta Margareta Ulla Annika
Malin Frida Hedda Nora Thea Mette Line Kirsten Aino Aada Helmi Kaisa Leena Tuuli`),
  family: words(`Andersson Johansson Karlsson Nilsson Eriksson Larsson Olsson Persson Svensson Gustafsson Pettersson
Jonsson Jansson Hansson Bengtsson Lindberg Lindström Lindqvist Lindgren Berglund Bergström Sandberg Holm Nyström
Lundgren Lundqvist Ekström Sjöberg Wallin Engström Hansen Johansen Olsen Larsen Andersen Pedersen Nilsen Kristiansen
Jensen Karlsen Haugen Bakken Dahl Berg Halvorsen Nielsen Christensen Rasmussen Jørgensen Madsen Korhonen Virtanen
Mäkinen Nieminen Mäkelä Hämäläinen Laine Heikkinen Koskinen Järvinen`),
};

/** ファンタジー風（このツール用に作った架空の名前） */
export const FANTASY: NameLists = {
  male: words(`Aldric Thorne Kaelen Eldrin Varis Doran Caelum Theron Faelan Garrick Orin Rowan Silas Talon Zephyr
Alaric Bram Cedric Darian Halvar Ivor Jarek Kael Loric Marek Nolan Oberon Perrin Quillon Riven Soren Tavish Ulric
Vaelor Wystan Xander Yorick Zarek Aerion Belric Corvin Draven Evander Galen Lucan Maelis Oswin Peregrin`),
  female: words(`Aria Elowen Seraphine Lyra Isolde Aeliana Celestine Daelia Elara Faye Gwendolyn Ilyra Jessamine Kaelith
Liora Nerissa Oriel Phaedra Rhiannon Sylvara Talia Valeria Wren Ysolde Zinnia Amara Briar Cressida Elysia Fiora
Ishara Nimue Ondine Sariel Thalia Vesper Aurelia Calista Evadne Ianthe Melisande Rosalind Selene Maelwen Corisande`),
  family: words(`Ashford Blackwood Brightwater Stormvale Ironhart Silverleaf Ravenscroft Thornfield Duskmantle Frostbane
Goldmane Hawkridge Emberfall Mistvale Dragonmoor Greymane Swiftarrow Lightbringer Deepwood Copperfield Fairwind
Holloway Kingsley Larkspur Northcott Quickwater Redfern Whitlock Ashenvale Starcrest Stonebrook Wolfhelm Oakhollow`),
};

/** ファンタジー風の苗字を組み立てるパーツ */
export const FANTASY_FAMILY_HEAD = words(`Ash Black Bright Storm Iron Silver Raven Thorn Dusk Frost Gold Hawk Moon Night
Star Stone Sun Wind Wolf Ember Mist Dragon Grey Swift Light Deep Red White Oak Elder Winter Shadow Fire River Glen
Copper Rose Lark Crow Fox`);
export const FANTASY_FAMILY_TAIL = words(`ford wood water wind hart leaf croft field mantle bane mane shade mere fall brook
vale moor arrow helm forge crest ridge holt wick ton ward wright hollow gate song heart`);
