
const AppAppoint = (() => {
    const STORAGE_KEY = "beautybook_agendamentos";

    const servicos = [
        { nome: "Corte de Cabelo", valor: 80 },
        { nome: "Manicure", valor: 50 },
        { nome: "Escova", valor: 60 },
        { nome: "Design Sobrancelha", valor: 40 }
    ];

    const horarios = [
        "09:00", "10:00", "11:00",
        "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00"
    ];

    let servicoAtual = null;

    function carregarAgendamentos() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function salvarAgendamentos(lista) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }

    function dataLocal() {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    function formatarData(data) {
        if (!data) return "";

        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function dinheiro(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function selecionarServico(nome, valor) {
        const servico = servicos.find(
            item => item.nome === nome && item.valor === valor
        );

        if (!servico) {
            alert("Serviço não encontrado.");
            return;
        }

        servicoAtual = servico;

        document.getElementById("servicoSelecionado").textContent =
            `${servico.nome} selecionado — ${dinheiro(servico.valor)}`;

        atualizarHorarios();
    }

    function atualizarHorarios() {
        const data = document.getElementById("data").value;
        const campoHora = document.getElementById("hora");

        campoHora.innerHTML = "";

        const opcaoInicial = document.createElement("option");
        opcaoInicial.value = "";
        opcaoInicial.textContent = "Selecione um horário";
        campoHora.appendChild(opcaoInicial);

        if (!data) return;

        const agendamentos = carregarAgendamentos();

        const ocupados = agendamentos
            .filter(item => item.data === data)
            .map(item => item.hora);

        horarios.forEach(horario => {
            if (!ocupados.includes(horario)) {
                const opcao = document.createElement("option");
                opcao.value = horario;
                opcao.textContent = horario;
                campoHora.appendChild(opcao);
            }
        });

        if (campoHora.options.length === 1) {
            opcaoInicial.textContent = "Não há horários disponíveis";
        }
    }

    function agendar() {
        const data = document.getElementById("data").value;
        const hora = document.getElementById("hora").value;

        if (!servicoAtual) {
            alert("Selecione um serviço primeiro.");
            return;
        }

        if (!data || !hora) {
            alert("Selecione a data e o horário.");
            return;
        }

        if (data < dataLocal()) {
            alert("Não é possível agendar em uma data passada.");
            return;
        }

        const agendamentos = carregarAgendamentos();

        const horarioOcupado = agendamentos.some(item =>
            item.data === data && item.hora === hora
        );

        if (horarioOcupado) {
            alert("Este horário já está ocupado.");
            atualizarHorarios();
            return;
        }

        const novoAgendamento = {
            id: Date.now().toString() +
                Math.random().toString(36).slice(2, 7),
            servico: servicoAtual.nome,
            valor: servicoAtual.valor,
            data,
            hora,
            criadoEm: new Date().toISOString()
        };

        agendamentos.push(novoAgendamento);

        salvarAgendamentos(agendamentos);

        alert("Agendamento confirmado com sucesso!");

        servicoAtual = null;

        document.getElementById("servicoSelecionado").textContent =
            "Selecione um serviço acima";

        atualizarHorarios();
        atualizarAgenda();
    }

    function atualizarAgenda() {
        const lista = document.getElementById("lista");
        const total = document.getElementById("total");
        const dataSelecionada =
            document.getElementById("data").value || dataLocal();

        const agendamentos = carregarAgendamentos()
            .filter(item => item.data === dataSelecionada)
            .sort((a, b) => a.hora.localeCompare(b.hora));

        lista.innerHTML = "";

        if (agendamentos.length === 0) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");

            celula.colSpan = 5;
            celula.textContent = "Nenhum agendamento nesta data.";
            celula.style.textAlign = "center";
            celula.style.padding = "25px";

            linha.appendChild(celula);
            lista.appendChild(linha);
        } else {
            agendamentos.forEach(item => {
                const linha = document.createElement("tr");

                const dados = [
                    item.servico,
                    formatarData(item.data),
                    item.hora,
                    dinheiro(item.valor)
                ];

                dados.forEach(valor => {
                    const celula = document.createElement("td");
                    celula.textContent = valor;
                    linha.appendChild(celula);
                });

                const acao = document.createElement("td");
                const botao = document.createElement("button");

                botao.textContent = "Cancelar";
                botao.type = "button";
                botao.style.cssText =
                    "border:0;background:#f8e7ed;color:#a04465;" +
                    "padding:7px 10px;border-radius:7px;cursor:pointer;";

                botao.addEventListener("click", () => {
                    remover(item.id);
                });

                acao.appendChild(botao);
                linha.appendChild(acao);
                lista.appendChild(linha);
            });
        }

        const faturamento = agendamentos.reduce(
            (soma, item) => soma + Number(item.valor),
            0
        );

        total.textContent =
            `Total: ${dinheiro(faturamento)}`;
    }

    function remover(id) {
        if (!confirm("Deseja cancelar este agendamento?")) {
            return;
        }

        const agendamentos = carregarAgendamentos()
            .filter(item => item.id !== id);

        salvarAgendamentos(agendamentos);

        atualizarHorarios();
        atualizarAgenda();

        alert("Agendamento cancelado.");
    }

    function iniciar() {
        const campoData = document.getElementById("data");

        campoData.min = dataLocal();

        campoData.addEventListener("change", () => {
            atualizarHorarios();
            atualizarAgenda();
        });

        atualizarHorarios();
        atualizarAgenda();
    }

    return {
        selecionarServico,
        agendar,
        remover,
        iniciar
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    AppAppoint.iniciar();
});
