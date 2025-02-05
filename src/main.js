const menuDashboard = document.getElementById('menu-dashboard');
const menuProducts = document.getElementById('menu-products');
const menuOrders = document.getElementById('menu-orders');
const menuAllOrders = document.getElementById('menu-all-orders');

const dashboard = document.getElementById('dashboard');
const productForm = document.getElementById('product-form');
const orderForm = document.getElementById('order-form');
const allOrdersForm = document.getElementById('all-orders');

const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productTableBody = document.getElementById('product-table').querySelector('tbody');
const orderProductSelect = document.getElementById('order-product');
const addProductButton = document.getElementById('add-product');

// Selecionar todos os links do menu
const menuLinks = document.querySelectorAll('nav a');

menuLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    // Atualizar o atributo data-current
    menuLinks.forEach(menu => menu.setAttribute('data-current', 'false'));
    link.setAttribute('data-current', 'true');

    // Exibir/ocultar as seções correspondentes
    const sectionId = link.getAttribute('href').substring(1);
    document.querySelectorAll('.container').forEach(section => {
      if (section.id === sectionId) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    // Atualizar o título da página
    const titles = {
      "dashboard": 'Início | orderfy',
      "products": 'Produtos | orderfy',
      "orders": 'Criar Pedido | orderfy',
      "all-orders": 'Pedidos | orderfy',
    };
    
    document.title = titles[sectionId] || 'orderfy';

    // Executar ações específicas por seção
    if (sectionId === 'dashboard') {
      updateDashboard();
    } else if (sectionId === 'products') {
      loadProducts();
    } else if (sectionId === 'orders') {
      loadOrderProducts();
    } else if (sectionId === "all-orders") {
      loadOrders();
    }
  });
});

const saveProduct = (name, price) => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push({ name, price: parseFloat(price) });
    localStorage.setItem('products', JSON.stringify(products));
};

const loadProducts = () => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    productTableBody.innerHTML = '';

    products.forEach((product, index) => {
        const row = `
        <tr>
          <td>${product.name}</td>
          <td>R$ ${product.price.toFixed(2)}</td>
          <td>${product.category}</td>
          <td class="actions">
            <button class="cta cta-outline" onclick="editProduct(${index})">Editar</button>
            <button class="cta cta-ghost" onclick="deleteProduct(${index})">Excluir</button>
          </td>
        </tr>
      `;
        productTableBody.innerHTML += row;
    });
};


const editProduct = (index) => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[index];

    const newName = prompt('Editar Nome do Produto:', product.name);
    const newPrice = parseFloat(prompt('Editar Preço do Produto:', product.price.toFixed(2)));
    const newCategory = prompt('Editar Categoria do Produto:', product.category);

    if (newName && !isNaN(newPrice) && newCategory) {
        products[index] = { name: newName, price: newPrice, category: newCategory };
        localStorage.setItem('products', JSON.stringify(products));
        alert('Produto atualizado com sucesso!');
        loadProducts();
    } else {
        // alert('Entrada inválida! Tente novamente.');
    }
};


const deleteProduct = (index) => {
    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (confirm(`Tem certeza que deseja excluir o produto "${products[index].name}"?`)) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
    }
};

const loadOrderProducts = () => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    orderProductSelect.innerHTML = '<option value="">Selecione um produto</option>';

    // Agrupar produtos por categoria
    const groupedProducts = products.reduce((groups, product) => {
        if (!groups[product.category]) {
            groups[product.category] = [];
        }
        groups[product.category].push(product);
        return groups;
    }, {});

    // Criar <optgroup> para cada categoria
    Object.entries(groupedProducts).forEach(([category, productsInCategory]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;

        productsInCategory.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = `${product.name} - R$ ${product.price.toFixed(2)}`;
            optgroup.appendChild(option);
        });

        orderProductSelect.appendChild(optgroup);
    });
};


addProductButton.addEventListener('click', () => {
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const category = document.getElementById('product-category').value.trim();

    if (!name || isNaN(price) || !category) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const existingProduct = products.find(product => product.name.toLowerCase() === name.toLowerCase());

    if (existingProduct) {
        if (existingProduct.price === price && existingProduct.category.toLowerCase() === category.toLowerCase()) {
            // Mesmo nome, preço e categoria
            // alert('Produto já cadastrado com o mesmo nome, preço e categoria.');
            productNameInput.value = '';
            productPriceInput.value = '';
            document.getElementById('product-category').value = '';
        } else {
            // Produto com o mesmo nome, mas preço ou categoria diferentes
            const confirmUpdate = confirm(
                `Já existe um produto com o nome "${name}" registrado com:\n` +
                `Preço: R$ ${existingProduct.price.toFixed(2)} | Categoria: ${existingProduct.category}.\n` +
                `Deseja atualizar para:\n` +
                `Preço: R$ ${price.toFixed(2)} | Categoria: ${category}?`
            );

            if (confirmUpdate) {
                existingProduct.price = price;
                existingProduct.category = category;
                localStorage.setItem('products', JSON.stringify(products));
                // alert('Produto atualizado com sucesso!');
                productNameInput.value = '';
                productPriceInput.value = '';
                document.getElementById('product-category').value = '';
                loadProducts();
            }
        }
    } else {
        // Produto novo
        products.push({ name, price, category });
        localStorage.setItem('products', JSON.stringify(products));
        //   alert('Produto cadastrado com sucesso!');
        productNameInput.value = '';
        productPriceInput.value = '';
        document.getElementById('product-category').value = '';
        loadProducts();
    }
});


const updateDashboard = () => {
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('total-revenue').textContent = `R$ ${totalRevenue.toFixed(2)}`;

    const totalOrdersMonth = allOrders.length;
    document.getElementById('total-orders-month').textContent = `${totalOrdersMonth}`;

    const today = new Date().toISOString().split('T')[0];
    const totalOrdersDay = allOrders.filter(order => new Date(order.id).toISOString().split('T')[0] === today).length;
    document.getElementById('total-orders-day').textContent = `${totalOrdersDay}`;

    const productCounts = {};
    allOrders.forEach(order => {
        order.items.forEach(item => {
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
        });
    });

    const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0] || ["-", 0];
    document.getElementById('top-product').textContent = `${topProduct[0]} (${topProduct[1]})`;

    renderWeeklyRevenueChart(allOrders);
    renderTopProductsChart(productCounts);
};

let weeklyRevenueChart; // Variável global para armazenar o gráfico

const renderWeeklyRevenueChart = (orders) => {
    const ctx = document.getElementById('weekly-revenue-chart').getContext('2d');
    const weeklyData = Array(7).fill(0);
    const today = new Date();

    orders.forEach(order => {
        const orderDate = new Date(order.id);
        const diffDays = (today - orderDate) / (1000 * 60 * 60 * 24);
        if (diffDays >= 0 && diffDays < 7) {
            weeklyData[Math.floor(diffDays)] += order.total;
        }
    });

    // Verifica se já existe um gráfico e o destrói antes de criar um novo
    if (weeklyRevenueChart) {
        weeklyRevenueChart.destroy();
    }

    // Cria um novo gráfico
    weeklyRevenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['6 dias atrás', '5 dias atrás', '4 dias atrás', '3 dias atrás', '2 dias atrás', 'Ontem', 'Hoje'],
            datasets: [{
                label: 'Receita',
                data: weeklyData.reverse(),
                borderColor: '#8b5cf6',
                fill: false,
            }]
        },
        options: {
            responsive: true, // Permite redimensionamento automático
            maintainAspectRatio: false, // Permite ajustar a proporção ao container
        }
    });
};

const themeToggleButton = document.getElementById('theme-toggle');
const rootElement = document.documentElement;

// Variável global para armazenar o gráfico de produtos mais vendidos
let topProductsChart;

// Função para recriar o gráfico de Top Products
const renderTopProductsChart = (productCounts) => {
    const ctx = document.getElementById('top-products-chart').getContext('2d');
    const sortedProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

    // Destroi o gráfico existente antes de criar um novo
    if (topProductsChart) {
        topProductsChart.destroy();
    }

    // Define as cores com base no tema atual
    const isDark = rootElement.classList.contains('dark');
    const borderColor = isDark ? '#000000' : '#FFF'; // Branco para dark, preto para light

    // Criação do gráfico
    topProductsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedProducts.map(p => `${p[0]} (${p[1]})`),
            datasets: [{
                data: sortedProducts.map(p => p[1]),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4CAF50',
                    '#FF9F40', '#9966FF', '#FFCD56', '#FF6F91',
                    '#A7FFEB', '#8C9EFF', '#B9FBC0', '#FFC400',
                ],
                borderColor: borderColor, // Cor da borda baseada no tema
                borderWidth: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                },
            },
        },
    });
};

// Função para alternar o tema
const toggleTheme = () => {
    const isDark = rootElement.classList.contains('dark');

    if (isDark) {
        rootElement.classList.remove('dark'); // Tema claro
        themeToggleButton.innerHTML = '<i class="ph ph-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        rootElement.classList.add('dark'); // Tema escuro
        themeToggleButton.innerHTML = '<i class="ph ph-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }

    // Atualiza o gráfico de Top Products se estiver na tela de dashboard
    const currentSection = document.querySelector('.container:not(.hidden)').id;
    if (currentSection === 'dashboard') {
        const productCounts = {}; // Obtenha os dados reais do gráfico
        const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];

        allOrders.forEach(order => {
            order.items.forEach(item => {
                productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
            });
        });

        renderTopProductsChart(productCounts);
    }
};

// Verificar o tema salvo no `localStorage` ao carregar a página
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    rootElement.classList.add('dark');
    themeToggleButton.innerHTML = '<i class="ph ph-sun"></i>';
} else {
    rootElement.classList.remove('dark');
    themeToggleButton.innerHTML = '<i class="ph ph-moon"></i>';
}

// Adicionar o evento de clique ao botão
themeToggleButton.addEventListener('click', toggleTheme);

const importProductsInput = document.getElementById('import-products');

importProductsInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    
    if (!file) {
        alert('Nenhum arquivo selecionado!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvContent = e.target.result;
        parseCSVAndAddProducts(csvContent);
    };
    reader.readAsText(file);
});

const parseCSVAndAddProducts = (csvContent) => {
    const rows = csvContent.split('\n');
    const products = JSON.parse(localStorage.getItem('products')) || [];

    rows.forEach((row, index) => {
        if (index === 0) return; // Ignorar o cabeçalho

        const [name, price, category] = row.split(',');

        if (name && price && category) {
            const existingProduct = products.find(
                (product) => product.name.toLowerCase() === name.trim().toLowerCase()
            );

            if (existingProduct) {
                // Atualizar produto existente
                existingProduct.price = parseFloat(price.trim());
                existingProduct.category = category.trim();
            } else {
                // Adicionar novo produto
                products.push({
                    name: name.trim(),
                    price: parseFloat(price.trim()),
                    category: category.trim(),
                });
            }
        }
    });

    localStorage.setItem('products', JSON.stringify(products));
    alert('Produtos importados com sucesso!');
    loadProducts(); // Atualizar a tabela de produtos
};

// Elementos do pedido
const addToOrderButton = document.getElementById('add-to-order');
const finalizeOrderButton = document.getElementById('finalize-order');
const orderTableBody = document.getElementById('order-table').querySelector('tbody');
const orderTotalSpan = document.getElementById('order-total');

let currentOrder = []; // Armazena os itens do pedido atual

// Adicionar itens ao pedido
addToOrderButton.addEventListener('click', () => {
    const productName = orderProductSelect.value;
    const quantity = parseInt(document.getElementById('order-quantity').value, 10);
    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (!productName || quantity <= 0) {
        alert('Selecione um produto e insira uma quantidade válida!');
        return;
    }

    const product = products.find(p => p.name === productName);

    if (!product) {
        alert('Produto não encontrado!');
        return;
    }

    const existingItem = currentOrder.find(item => item.name === product.name);

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal += product.price * quantity;
    } else {
        currentOrder.push({
            name: product.name,
            price: product.price,
            quantity,
            subtotal: product.price * quantity,
        });
    }

    updateOrderTable();
});

// Atualiza a tabela de itens do pedido
const updateOrderTable = () => {
    orderTableBody.innerHTML = '';
    let total = 0;

    currentOrder.forEach((item, index) => {
        total += item.subtotal;
        const row = `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>R$ ${item.subtotal.toFixed(2)}</td>
          <td class="actions"><button class="cta cta-ghost" onclick="deleteOrderItem(${index})">Excluir</button></td>
        </tr>
      `;
        orderTableBody.innerHTML += row;
    });

    orderTotalSpan.textContent = `R$ ${total.toFixed(2)}`;
};

const deleteOrderItem = (index) => {
    if (confirm(`Tem certeza que deseja remover "${currentOrder[index].name}" do pedido?`)) {
        currentOrder.splice(index, 1); // Remove o item pelo índice
        updateOrderTable(); // Atualiza a tabela
    }
};

// Finalizar pedido
finalizeOrderButton.addEventListener('click', () => {
  if (currentOrder.length === 0) {
    alert('Adicione itens ao pedido antes de finalizar!');
    return;
  }

  const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
  const orderId = new Date().toISOString(); // Usado como ID único
  const orderDate = new Date().toLocaleDateString('pt-BR'); // Data no formato DD/MM/YYYY
  const description = document.getElementById('order-description').value.trim(); // Captura a descrição do pedido
  const total = currentOrder.reduce((sum, item) => sum + item.subtotal, 0);

  if (!description) {
    alert('Por favor, adicione uma descrição para o pedido!');
    return;
  }

  allOrders.push({
    id: orderId,
    date: orderDate,
    description, // Adiciona a descrição ao pedido
    items: currentOrder,
    total,
  });

  localStorage.setItem('allOrders', JSON.stringify(allOrders));
  currentOrder = [];
  document.getElementById('order-description').value = ''; // Limpa o campo de descrição
  updateOrderTable();
  alert('Pedido finalizado com sucesso!');
});

const allOrdersTableBody = document.getElementById('all-orders-table').querySelector('tbody');

// Carregar pedidos na aba "Listar Pedidos"
const loadOrders = () => {
  const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
  allOrdersTableBody.innerHTML = ''; // Limpa o conteúdo existente

  allOrders.forEach((order, index) => {
    const row = document.createElement('tr');

    // Coluna de ID
    const idCell = document.createElement('td');
    idCell.textContent = index + 1;
    row.appendChild(idCell);

    // Coluna de Itens
    const itemsCell = document.createElement('td');
    itemsCell.textContent = order.items
      .map(item => `${item.quantity}x ${item.name}`)
      .join(', ');
    row.appendChild(itemsCell);

    // Coluna de Descrição
    const descriptionCell = document.createElement('td');
    descriptionCell.className = 'description';
    descriptionCell.title = order.description || 'Sem descrição';
    descriptionCell.textContent = order.description || 'Sem descrição';
    row.appendChild(descriptionCell);

    // Coluna de Total
    const totalCell = document.createElement('td');
    totalCell.textContent = `R$ ${order.total.toFixed(2)}`;
    row.appendChild(totalCell);

    // Coluna de Data
    const dateCell = document.createElement('td');
    dateCell.textContent = order.date;
    row.appendChild(dateCell);

    // Coluna de Ações
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';

    // Botão de Imprimir
    const printButton = document.createElement('button');
    printButton.type = 'button';
    printButton.className = 'cta cta-secondary';
    printButton.textContent = 'Imprimir';
    printButton.addEventListener('click', () => {
      const zpl = generateZPL(index, order);
      printOrder(zpl);
    });
    actionsCell.appendChild(printButton);

    // Botão de Copiar
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'cta cta-outline';
    copyButton.innerHTML = `<i class="ph ph-copy"></i> Copiar`;
    copyButton.addEventListener('click', () => copyOrder(order.id));
    actionsCell.appendChild(copyButton);

    // Botão de Cancelar
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'cta cta-ghost';
    cancelButton.innerHTML = `<i class="ph ph-x"></i> Cancelar`;
    cancelButton.addEventListener('click', () => deleteOrder(order.id));
    actionsCell.appendChild(cancelButton);

    row.appendChild(actionsCell);
    allOrdersTableBody.appendChild(row);
  });
};


const breakTextIntoLines = (text, maxCharsPerLine) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
};

function generateZPL(index, order) {
  // Função para quebrar texto em várias linhas com base em um limite de caracteres
  const breakTextIntoLines = (text, maxCharsPerLine) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxCharsPerLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    if (currentLine.trim().length > 0) {
      lines.push(currentLine.trim());
    }

    return lines;
  };

  // Converter e formatar a data corretamente
  const formattedDate = new Date(order.id).toLocaleDateString('pt-BR'); // Formato DD/MM/YYYY
  const formattedTime = new Date(order.id).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Quebrar a descrição em várias linhas, se necessário
  const descriptionLines = breakTextIntoLines(order.description || 'Sem descrição', 40);

  // Gerar o ZPL para os itens
  let currentY = 356; // Posição inicial para os itens
  const itemsZPL = order.items
    .map(item => {
      const itemNameLines = breakTextIntoLines(item.name, 20); // Quebrar o nome do item
      const linesZPL = itemNameLines.map((line, index) => {
        const yPosition = currentY + index * 30; // Incrementar a posição Y para cada linha do nome
        if (index === 0) {
          // Primeira linha do item inclui quantidade, unitário e subtotal
          return `^FO16,${yPosition}^A0N,22,22^FD${item.quantity.toString().padStart(3)} ${line.padEnd(20)} R$ ${item.price
            .toFixed(2)
            .padStart(7)} ${item.subtotal.toFixed(2).padStart(10)}^FS`;
        } else {
          // Linhas subsequentes incluem apenas o nome do item
          return `^FO16,${yPosition}^A0N,22,22^FD    ${line.padEnd(20)}^FS`;
        }
      });
      currentY += itemNameLines.length * 30; // Atualizar a posição Y com base no número de linhas do nome
      return linesZPL.join('\n');
    })
    .join('\n');

  // Adicionar as linhas da descrição ao ZPL
  const descriptionZPL = descriptionLines
    .map((line, index) => `^FO16,${176 + index * 30}^A0N,25,25^FD${line}^FS`)
    .join('\n');

  // Calcular a altura dinâmica do documento
  const descriptionHeight = descriptionLines.length * 30; // Altura das linhas de descrição
  const itemsHeight = currentY - 356; // Altura dinâmica dos itens

  // ZPL ajustado
  return `
^XA
^PW560       // Define a largura do documento em 560 dots (~7 cm a 203 DPI)
^LL${700 + descriptionHeight + itemsHeight}       // Altura dinâmica do documento
^LH8,16      // Padding: 8px nas laterais e 16px no topo
^FO16,16^A0N,30,30^FDObrigado por comprar com a gente!^FS
^FO16,56^A0N,25,25^FDControle: 0000000${index}^FS

^FO16,96^GB528,1,3^FS // Linha divisória

^FO16,116^A0N,25,25^FDData: ${formattedDate}^FS
^FO16,146^A0N,25,25^FDHora: ${formattedTime}^FS

${descriptionZPL}

^FO16,${176 + descriptionHeight + 20}^GB528,1,3^FS // Linha divisória

^FO16,${196 + descriptionHeight + 20}^A0N,25,25^FDQTD   DESCRIÇÃO            UNIT      VALOR^FS
^FO16,${226 + descriptionHeight + 20}^GB528,1,3^FS // Linha divisória

${itemsZPL}

^FO16,${currentY + 20}^GB528,1,3^FS // Linha divisória

^FO16,${currentY + 40}^A0N,25,25^FDSUBTOTAL                                                        R$ ${order.total.toFixed(2).padStart(7)}^FS

^FO16,${currentY + 80}^GB528,1,3^FS // Linha divisória

^FO16,${currentY + 100}^A0N,30,30^FDTOTAL                                                R$ ${order.total.toFixed(2).padStart(7)}^FS
^XZ
  `;
}

async function sendToZebra(zpl) {
  try {
    // Solicitar permissão para acessar o dispositivo USB
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x0A5F }], // Substitua pelo vendorId da sua impressora
    });

    // Abrir conexão com o dispositivo
    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    await device.claimInterface(0);

    // Converter o ZPL em bytes e enviar para a impressora
    const encoder = new TextEncoder();
    const data = encoder.encode(zpl);
    await device.transferOut(1, data); // Transferir dados para o endpoint da impressora

    alert('Pedido enviado para a impressora com sucesso!');
  } catch (error) {
    console.error('Erro ao se conectar à impressora:', error);
    alert('Erro ao enviar para a impressora. Verifique se o WebUSB é compatível.');
  }
}

function printOrder(zpl) {
  // Criar um arquivo de texto com o ZPL
  const blob = new Blob([zpl], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);

  // Criar um link para download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pedido.zpl';
  document.body.appendChild(a);
  a.click();

  // Limpar o URL
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  sendToZebra(zpl);
}

const deleteOrder = (orderId) => {
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const orderIndex = allOrders.findIndex(order => order.id === orderId);

    if (orderIndex > -1) {
        if (confirm(`Tem certeza que deseja excluir o pedido #${orderIndex + 1}?`)) {
            allOrders.splice(orderIndex, 1);
            localStorage.setItem('allOrders', JSON.stringify(allOrders));
            loadOrders();
            updateDashboard(); // Atualiza o dashboard após excluir um pedido
        }
    } else {
        alert('Pedido não encontrado!');
    }
}

// Exibir detalhes do pedido (exemplo de funcionalidade extra)
const viewOrderDetails = (orderId) => {
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const order = allOrders.find(order => order.id === orderId);

    if (order) {
        alert(
            `Pedido ID: ${order.id}\nItens:\n` +
            order.items.map(item => `- ${item.quantity}x ${item.name} (R$ ${item.subtotal.toFixed(2)})`).join('\n') +
            `\n\nTotal: R$ ${order.total.toFixed(2)}`
        );
    } else {
        alert('Pedido não encontrado!');
    }
};

document.getElementById('export-products').addEventListener('click', () => {
    const products = JSON.parse(localStorage.getItem('products')) || [];

    const worksheetData = products.map(product => ({
        Nome: product.name,
        Preço: `R$ ${product.price.toFixed(2)}`,
        Categoria: product.category,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');

    XLSX.writeFile(workbook, 'produtos.xlsx');
});

document.getElementById('export-orders').addEventListener('click', () => {
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];

    const worksheetData = allOrders.map((order, index) => ({
        ID: index + 1,
        Itens: order.items.map(item => `${item.quantity}x ${item.name}`).join(', '),
        Total: `R$ ${order.total.toFixed(2)}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    XLSX.writeFile(workbook, 'pedidos.xlsx');
});

const copyOrder = (orderId) => {
  const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
  const order = allOrders.find(order => order.id === orderId);

  if (!order) {
      alert('Pedido não encontrado!');
      return;
  }

  // Gerar a mensagem formatada
  const itemsText = order.items
      .map(item => `${item.quantity}x - ${item.name}`)
      .join('\n');
  
  const message = `Então, seu pedido vai ser:\n\n${itemsText}\n\n${order.description || ''}`;

  // Copiar para a área de transferência
  navigator.clipboard.writeText(message)
      .then(() => {
          alert('Pedido copiado!');
      })
      .catch(() => {
          alert('Erro ao copiar o pedido. Tente novamente!');
      });
};

const exportDashboardButton = document.getElementById('export-dashboard');

exportDashboardButton.addEventListener('click', () => {
    // Obter os dados do Dashboard
    const totalRevenue = document.getElementById('total-revenue').textContent;
    const totalOrdersMonth = document.getElementById('total-orders-month').textContent;
    const totalOrdersDay = document.getElementById('total-orders-day').textContent;
    const topProduct = document.getElementById('top-product').textContent;

    // Obter os pedidos do dia
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = allOrders.filter(order => new Date(order.id).toISOString().split('T')[0] === today);

    // Agrupar os produtos mais vendidos do dia
    const productCounts = {};
    todayOrders.forEach(order => {
        order.items.forEach(item => {
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
        });
    });

    // Encontrar o produto mais vendido do dia
    const topProductToday = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])[0] || ['Nenhum', 0];

    // Estruturar os dados em arrays de objetos
    const dashboardData = [
        { Indicador: 'Receita Total (mês)', Valor: totalRevenue },
        { Indicador: 'Pedidos (mês)', Valor: totalOrdersMonth },
        { Indicador: 'Pedidos (dia)', Valor: totalOrdersDay },
        { Indicador: 'Produto Mais Vendido', Valor: topProduct },
    ];

    const ordersData = todayOrders.map((order, index) => ({
        ID: index + 1,
        Itens: order.items.map(item => `${item.quantity}x ${item.name}`).join(', '),
        Total: `R$ ${order.total.toFixed(2)}`,
        Descrição: order.description || 'Sem descrição',
        Data: order.date,
    }));

    const topProductsTodayData = [
        { Produto: topProductToday[0], Quantidade: topProductToday[1] },
    ];

    // Criar a planilha Excel
    const workbook = XLSX.utils.book_new();

    // Adicionar os dados do Dashboard
    const dashboardSheet = XLSX.utils.json_to_sheet(dashboardData);
    XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');

    // Adicionar os pedidos do dia
    const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Pedidos do Dia');

    // Adicionar os produtos mais vendidos do dia
    const topProductsSheet = XLSX.utils.json_to_sheet(topProductsTodayData);
    XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Mais Vendidos Hoje');

    // Salvar o arquivo Excel
    XLSX.writeFile(workbook, 'dashboard-completo.xlsx');
});

// Adicionar o evento de clique ao botão
themeToggleButton.addEventListener('click', toggleTheme);

window.addEventListener('resize', () => {
    if (weeklyRevenueChart) weeklyRevenueChart.resize();
    if (topProductsChart) topProductsChart.resize();
});  

// Inicialização
updateDashboard();