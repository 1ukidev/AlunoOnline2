const txtMatricula = document.getElementById('txtMatricula');
const txtToken = document.getElementById('txtToken');
const result = document.getElementById('result');

const Api = Object.freeze({
    perfil: {
        async get(matricula, token) {
            const url = `https://apialuno.seduc.ce.gov.br/api/v3/alunos/${matricula}/perfil`;
            return await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                return Util.tratarResponse(response);
            });
        }
    },

    boletim: {
        async get(matricula, token, ano, semestre) {
            const url = `https://apialuno.seduc.ce.gov.br/api/v3/medias/${ano}/${semestre}?alunoId=${matricula}`;
            return await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                return Util.tratarResponse(response);
            });
        }
    }
});

const Util = Object.freeze({
    tratarResponse: (response) => {
        if (!response.ok) {
            switch (response.status) {
                case 401:
                    return { error: 'Erro: token inválido' };
                case 403:
                    return { error: 'Erro: acesso negado' };
                default:
                    return { error: 'Erro ao buscar os dados do aluno' };
            }
        }
        return response.json();
    },

    validarForm: () => {
        if (!txtMatricula.value || !txtToken.value) {
            result.innerHTML = `
                <h2>Resultado:</h2>
                <p>Informe a matrícula e o token</p>
            `;
            return false;
        }
        return true;
    },

    extrairInformacoes: () => {
        if (!Util.validarForm()) { return; }
        result.innerHTML = `<h2>Carregando perfil...</h2>`;

        Api.perfil.get(txtMatricula.value, txtToken.value).then(response => {
            result.innerHTML = `<h2>Resultado:</h2>`;
            if (response.error) {
                result.innerHTML += `<p>${response.error}</p>`;
                return;
            }
            result.innerHTML += `
                <p><img src="${response.photoUrl}" alt="Foto do aluno"></p>
                <p>Matrícula: ${response.id}</p>
                <p>Nome: ${response.nome}</p>
                <p>E-mail: ${response.email}</p>
                <p>Sexo: ${response.sexo}</p>
                <p>Data de Nascimento: ${response.nascimento}</p>
                <p>Escola ID: ${response.escolaId}</p>
                <p>Escola INEP: ${response.escolaInep}</p>
                <p>Nome da Escola: ${response.escolaNome}</p>
                <p>Oferta: ${response.ofertaItem}</p>
                <p>Turma ID: ${response.turmaId}</p>
                <p>Nome da Turma: ${response.turmaNome}</p>
                <p>Ano Letivo: ${response.anoLetivo}</p>
                <p>Nome da Mãe: ${response.maeNome}</p>
                <p>Nome do Pai: ${response.paiNome}</p>
                <p>Nome do Responsável: ${response.responsavelNome ? response.responsavelNome : 'Não informado'}</p>
                <p>Email Google: ${response.emailGoogle}</p>
            `;
        });
    },

    baixarBoletim: () => {
        if (!Util.validarForm()) { return; }
        result.innerHTML = `<h2>Carregando boletim...</h2>`;

        const ano = prompt('Informe o ano do boletim:');
        const semestre = prompt('Informe o semestre do boletim:');
        if (!ano || !semestre) {
            result.innerHTML = `
                <h2>Resultado:</h2>
                <p>Informe o ano e o semestre</p>
            `;
            return;
        }

        Api.boletim.get(txtMatricula.value, txtToken.value, ano, semestre).then(response => {
            result.innerHTML = `<h2>Resultado:</h2>`;
            if (response.error) {
                result.innerHTML += `<p>${response.error}</p>`;
                return;
            }
            if (response.length === 0) {
                result.innerHTML += `<p>Nenhum boletim encontrado para o ano ${ano} e semestre ${semestre}</p>`;
                return;
            }
            result.innerHTML += `<p>Boletim baixado com sucesso</p>`;
            const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'boletim.json';
            a.click();
        });
    }
});
