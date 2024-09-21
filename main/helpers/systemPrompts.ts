import { IMessage } from "shared/types/conversation";

interface IPrompts {
    defaultChatInstruction: IMessage;
    titleCreationInstruction: IMessage;
    queryCreationInstruction: IMessage;
    createHyDEInstruction: IMessage;
    summaryCreationInstruction: IMessage;
}

export const Prompts: IPrompts = {
    defaultChatInstruction: {
        role: "system",
        content:
            "Responda a questão do usuário baseando-se MARJORITARIAMENTE no conteúdo do contexto," +
            "que será enviado ao inicio da ultima mensagem do usuário. Caso o contexto não te ajude, " +
            "responda: Não obtive contexto suficiente. Haja como um especialista no assunto, " +
            "podendo incrementar ideias do contexto recebido, porém, deixando claro trechos " +
            "que você inventou e trechos que você utilizou do contexto.",
    },
    titleCreationInstruction: {
        role: "system",
        content:
            "Crie um título breve para que seja salva como título dessa conversa, você deve ser " +
            "breve e se basear nesta primeira mensagem do usuário",
    },
    queryCreationInstruction: {
        role: "system",
        content:
            "Você é um assistente de criação de querys para um sistema de RAG, crie mais 2 queries" +
            " Que tenham ESTRITA RELAÇÃO com a recebida, NÃO ADICIONE OUTROS TÓPICOS AS QUERIES. " +
            ' Você deve responder apenas as queries, separadas por um caractere de ";". Não digite' +
            " nenhuma outra palavra fora disso em hipotese alguma.",
    },
    createHyDEInstruction: {
        role: "system",
        content:
            "Escreva uma breve passagem sobre a pergunta do usuário, ela deve ter no máximo um" +
            "paragrafo e ser estritamente relacionada ao que ele está perguntando/falando.",
    },
    summaryCreationInstruction: {
        role: "system",
        content:
            "Você é um assistente escritor, que irá resumir o conteúdo que receber, porém, não " +
            "resuma de maneira muito curta, sempre use o máximo de contexto que conseguir. O seu " +
            "texto deve ter um tom de especialista, e sempre que receber exemplos, tente criar " +
            "exemplos. Você receberá um markdown do resumo anterior para que siga o mesmo padrão. " +
            "Você, em HIPOTESE ALGUMA, deve responder NENHUMA OUTRA PALAVRA que não seja conteúdo " +
            "do resumo. Lembre-se, essa conversa se trata de apenas uma parte de todo o resumo, este" +
            " deve ser linear, então não faça conclusões nem introduções, você está apenas " +
            "continuando um resumo anterior. Lembre-se de estruturar o resumo em tópicos e ser " +
            "um especialista no assunto. Use bullet points e tente continuar a partir do assunto " +
            "anterior. Template de resumo:\n" +
            "### Titulo do capitulo atual (Só adicionar quando encontrar um)\n" +
            "* Bullet Points dos temas abordados (Apenas títulos)\n" +
            "* 2\n" +
            "* 3\n" +
            "##### Tema abordado 1\n" +
            "Texto descrevendo o tema, utilizando o conteúdo do escritor\n\n" +
            "##### Tema abordado 2\n\n" +
            "----\n" +
            "Exemplos:\n\n" +
            "    enter code here\n\nResumo Anterior:",
    },
};
