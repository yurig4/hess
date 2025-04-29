const problems = [
    // 1. Bem fácil (apenas dividir por 2)
        {
            problemId: 1,
            description: "Formação de HCl(g)",
            targetReaction: { reactants: { 'H2(g)': 0.5, 'Cl2(g)': 0.5 }, products: { 'HCl(g)': 1 }, deltaH: -92.3 },
            steps: [
                { id: 'p1_s1', original: { reactants: { 'H2(g)': 1, 'Cl2(g)': 1 }, products: { 'HCl(g)': 2 }, deltaH: -184.6 } } // Dividir por 2
            ]
        },
    
        // 2. Simples (inverter reação)
        {
            problemId: 2,
            description: "Formação de N₂O₄",
            targetReaction: { reactants: { 'NO2(g)': 2 }, products: { 'N2O4(g)': 1 }, deltaH: -57.2 },
            steps: [
                { id: 'p2_s1', original: { reactants: { 'N2(g)': 1, 'O2(g)': 2 }, products: { 'NO2(g)': 2 }, deltaH: 66.4 } }, // Inverter
                { id: 'p2_s2', original: { reactants: { 'N2(g)': 1, 'O2(g)': 2 }, products: { 'N2O4(g)': 1 }, deltaH: 9.2 } } // Manter
            ]
        },
    
        // 3. Formação de água - pequeno ajuste (multiplicar)
        {
            problemId: 3,
            description: "Formação de água líquida",
            targetReaction: { reactants: { 'H2(g)': 2, 'O2(g)': 1 }, products: { 'H2O(l)': 2 }, deltaH: -571.6 },
            steps: [
                { id: 'p3_s1', original: { reactants: { 'H2(g)': 1, 'O2(g)': 0.5 }, products: { 'H2O(l)': 1 }, deltaH: -285.8 } } // Multiplicar por 2
            ]
        },
    
        // 4. Formação de CO (envolve inverter uma reação)
        {
            problemId: 4,
            description: "Formação de CO (indireta)",
            targetReaction: { reactants: { 'C(s)': 1, 'O2(g)': 0.5 }, products: { 'CO(g)': 1 }, deltaH: -110.5 },
            steps: [
                { id: 'p4_s1', original: { reactants: { 'C(s)': 1, 'O2(g)': 1 }, products: { 'CO2(g)': 1 }, deltaH: -393.5 } }, // Manter
                { id: 'p4_s2', original: { reactants: { 'CO(g)': 1, 'O2(g)': 0.5 }, products: { 'CO2(g)': 1 }, deltaH: -283.0 } } // Inverter
            ]
        },
    
        // 5. Formação de NO (envolve multiplicação)
        {
            problemId: 5,
            description: "Formação de NO",
            targetReaction: { reactants: { 'N2(g)': 1, 'O2(g)': 1 }, products: { 'NO(g)': 2 }, deltaH: 180.5 },
            steps: [
                { id: 'p5_s1', original: { reactants: { 'N2(g)': 1, 'O2(g)': 1 }, products: { '2 NO(g)': 1 }, deltaH: 180.5 } } // Pequena adaptação de notação
            ]
        },
    
        // 6. Combustão do Metano (mais passos: inverter e multiplicar)
        {
            problemId: 6,
            description: "Combustão do Metano (indireta)",
            targetReaction: { reactants: { 'CH4(g)': 1, 'O2(g)': 2 }, products: { 'CO2(g)': 1, 'H2O(l)': 2 }, deltaH: -890.4 },
            steps: [
                { id: 'p6_s1', original: { reactants: { 'C(s)': 1, 'H2(g)': 2 }, products: { 'CH4(g)': 1 }, deltaH: -74.8 } }, // Inverter
                { id: 'p6_s2', original: { reactants: { 'C(s)': 1, 'O2(g)': 1 }, products: { 'CO2(g)': 1 }, deltaH: -393.5 } }, // Manter
                { id: 'p6_s3', original: { reactants: { 'H2(g)': 1, 'O2(g)': 0.5 }, products: { 'H2O(l)': 1 }, deltaH: -285.8 } } // Multiplicar por 2
            ]
        },
    
        // 7. Decomposição do Carbonato de Cálcio (várias ações)
        {
            problemId: 7,
            description: "Decomposição do Carbonato de Cálcio",
            targetReaction: { reactants: { 'CaCO3(s)': 1 }, products: { 'CaO(s)': 1, 'CO2(g)': 1 }, deltaH: 178.1 },
            steps: [
                { id: 'p7_s1', original: { reactants: { 'Ca(s)': 1, 'C(s)': 1, 'O2(g)': 1.5 }, products: { 'CaCO3(s)': 1 }, deltaH: -1207.0 } }, // Inverter
                { id: 'p7_s2', original: { reactants: { 'Ca(s)': 1, 'O2(g)': 0.5 }, products: { 'CaO(s)': 1 }, deltaH: -635.5 } }, // Manter
                { id: 'p7_s3', original: { reactants: { 'C(s)': 1, 'O2(g)': 1 }, products: { 'CO2(g)': 1 }, deltaH: -393.5 } } // Manter
            ]
        },
    
        // 8. Oxidação da Amônia (composto, exige várias manipulações)
        {
            problemId: 8,
            description: "Oxidação da Amônia (NH₃)",
            targetReaction: { reactants: { 'NH3(g)': 4, 'O2(g)': 5 }, products: { 'NO(g)': 4, 'H2O(l)': 6 }, deltaH: -1169.6 },
            steps: [
                { id: 'p8_s1', original: { reactants: { 'N2(g)': 1, 'H2(g)': 3 }, products: { 'NH3(g)': 2 }, deltaH: -92.2 } }, // Inverter + Multiplicar por 2
                { id: 'p8_s2', original: { reactants: { 'N2(g)': 1, 'O2(g)': 1 }, products: { 'NO(g)': 2 }, deltaH: 180.5 } }, // Multiplicar por 2
                { id: 'p8_s3', original: { reactants: { 'H2(g)': 1, 'O2(g)': 0.5 }, products: { 'H2O(l)': 1 }, deltaH: -285.8 } } // Multiplicar por 6
            ]
        },
    
        // 9. Formação de Etanol (adicionado com dados corretos)
        {
            problemId: 9,
            description: "Formação do Etanol (C₂H₅OH)",
            targetReaction: { reactants: { 'C(s)': 2, 'H2(g)': 3, 'O2(g)': 0.5 }, products: { 'C2H5OH(l)': 1 }, deltaH: -277.7 },
            steps: [
                { id: 'p9_s1', original: { reactants: { 'C2H5OH(l)': 1, 'O2(g)': 3 }, products: { 'CO2(g)': 2, 'H2O(l)': 3 }, deltaH: -1367.0 } }, // Inverter
                { id: 'p9_s2', original: { reactants: { 'C(s)': 1, 'O2(g)': 1 }, products: { 'CO2(g)': 1 }, deltaH: -393.5 } }, // Manter
                { id: 'p9_s3', original: { reactants: { 'H2(g)': 1, 'O2(g)': 0.5 }, products: { 'H2O(l)': 1 }, deltaH: -285.8 } } // Manter
            ]
        },
    
        // 10. Formação de SO₃ a partir de S (adição nova para completar)
        {
            problemId: 10,
            description: "Formação de Trióxido de Enxofre (SO₃)",
            targetReaction: { reactants: { 'S(s)': 2, 'O2(g)': 3 }, products: { 'SO3(g)': 2 }, deltaH: -790.4 },
            steps: [
                { id: 'p10_s1', original: { reactants: { 'S(s)': 1, 'O2(g)': 1 }, products: { 'SO2(g)': 1 }, deltaH: -296.8 } }, // Multiplicar por 2
                { id: 'p10_s2', original: { reactants: { 'SO2(g)': 2, 'O2(g)': 1 }, products: { 'SO3(g)': 2 }, deltaH: -197.6 } } // Manter
            ]
        },
    // 11. Combustão do Etanol
        {
            problemId: 11,
            description: "Combustão do Etanol (C₂H₅OH)",
            targetReaction: { reactants: { 'C2H5OH(l)': 1, 'O2(g)': 3 }, products: { 'CO2(g)': 2, 'H2O(l)': 3 }, deltaH: -1368 },
            steps: [
                { id: 'p11_s1', original: { reactants: { 'C(graph)': 2, 'H2(g)': 3, 'O2(g)': 0.5 }, products: { 'C2H5OH(l)': 1 }, deltaH: -278 } },
                { id: 'p11_s2', original: { reactants: { 'C(graph)': 1, 'O2(g)': 1 }, products: { 'CO2(g)': 1 }, deltaH: -394 } },
                { id: 'p11_s3', original: { reactants: { 'H2(g)': 1, 'O2(g)': 0.5 }, products: { 'H2O(l)': 1 }, deltaH: -286 } }
            ]
        },
    
        // 12. Hidrogenação do Eteno
        {
            problemId: 12,
            description: "Hidrogenação do Eteno para Etano",
            targetReaction: { reactants: { 'C2H4(g)': 1, 'H2(g)': 1 }, products: { 'C2H6(g)': 1 }, deltaH: -149.5 },
            steps: [
                { id: 'p12_s1', original: { reactants: { 'C2H4(g)': 1, 'O2(g)': 3 }, products: { 'CO2(g)': 2, 'H2O(l)': 2 }, deltaH: -1411.2 } },
                { id: 'p12_s2', original: { reactants: { 'H2(g)': 1, 'O2(g)': 0.5 }, products: { 'H2O(l)': 1 }, deltaH: -285.8 } },
                { id: 'p12_s3', original: { reactants: { 'C2H6(g)': 1, 'O2(g)': 3.5 }, products: { 'CO2(g)': 2, 'H2O(l)': 3 }, deltaH: -1560.7 } }
            ]
        },
    
        // 13. Decomposição de SO3
        {
            problemId: 13,
            description: "Decomposição do Trióxido de Enxofre (SO₃)",
            targetReaction: { reactants: { 'SO3(g)': 1 }, products: { 'SO2(g)': 1, 'O2(g)': 0.5 }, deltaH: 98 },
            steps: [
                { id: 'p13_s1', original: { reactants: { 'S(s)': 1, 'O2(g)': 1 }, products: { 'SO2(g)': 1 }, deltaH: -297 } },
                { id: 'p13_s2', original: { reactants: { 'S(s)': 1, 'O2(g)': 1.5 }, products: { 'SO3(g)': 1 }, deltaH: -395 } }
            ]
        },
    
        // 14. Combustão da Amônia
        {
            problemId: 14,
            description: "Combustão da Amônia (NH₃)",
            targetReaction: { reactants: { 'NH3(g)': 4, 'O2(g)': 3 }, products: { 'N2(g)': 2, 'H2O(g)': 6 }, deltaH: -1176 },
            steps: [
                { id: 'p14_s1', original: { reactants: { 'NH3(g)': 4, 'O2(g)': 7 }, products: { 'NO2(g)': 4, 'H2O(g)': 6 }, deltaH: -1132 } },
                { id: 'p14_s2', original: { reactants: { 'NO2(g)': 6, 'NH3(g)': 8 }, products: { 'N2(g)': 7, 'H2O(g)': 12 }, deltaH: -2740 } }
            ]
        },
    
        // 15. Formação do Metano por Hidrogenação
        {
            problemId: 15,
            description: "Formação do Metano (CH₄) por Hidrogenação da Grafita",
            targetReaction: { reactants: { 'C(graph)': 1, 'H2(g)': 2 }, products: { 'CH4(g)': 1 }, deltaH: -17.9 },
            steps: [
                { id: 'p15_s1', original: { reactants: { 'C(graph)': 1, 'O2(g)': 1 }, products: { 'CO2(g)': 1 }, deltaH: -94.1 } },
                { id: 'p15_s2', original: { reactants: { 'H2(g)': 1, 'O2(g)': 0.5 }, products: { 'H2O(l)': 1 }, deltaH: -68.3 } },
                { id: 'p15_s3', original: { reactants: { 'CH4(g)': 1, 'O2(g)': 2 }, products: { 'CO2(g)': 1, 'H2O(l)': 2 }, deltaH: -212.8 } }
            ]
        }
    ];