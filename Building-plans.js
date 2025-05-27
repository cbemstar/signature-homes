<script>
// Attributes v2 list instance and type-toggle logic
let listInst;
let currentBPslug = '';
function updateFiltersState() {
  const bpRadio = document.querySelector('input[name="type"][value="Building Plans"], input[name="type"][value="Building Plan"]');
  const isBP = bpRadio && bpRadio.checked;
  if (listInst) {
    if (isBP) {
      listInst.removeFilter('location');
      stripLocationField();
    } else {
      listInst.addFilter('location');
      // restore attribute now that location filtering is active
      restoreLocationField();
    }
    listInst.applyFilters();
  }
}
window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'list',
  (instances) => {
    listInst = instances[0];
    // reapply toggles whenever filters render (e.g., price slider changes)
    if (listInst && listInst.on) {
      listInst.on('renderitems', () => {
        updatePricesForSlug(currentBPslug);
      });
    }
    updateFiltersState();
  }
]);
// watch for type changes
document.body.addEventListener('change', function(e) {
  if (e.target.matches('input[name="type"]')) {
    updateFiltersState();
  }
});

(function(){
  // Helper to remove the location attribute from all location radios
  function stripLocationField() {
    document.querySelectorAll('.location-menu input[name="location"][fs-list-field="location"], .location-menu input[name="location-drawer"][fs-list-field="location"]]')
      .forEach(radio => {
        radio.removeAttribute('fs-list-field');
      });
  }

  // Helper to restore the location attribute to all location radios
  function restoreLocationField() {
    document.querySelectorAll('.location-menu input[name="location"], .location-menu input[name="location-drawer"]')
      .forEach(radio => {
        radio.setAttribute('fs-list-field', 'location');
      });
  }

  // Core update function: show only the matching franchise block, update price-filter-target text for matching franchise slug
  function updatePricesForSlug(slug) {
    currentBPslug = slug;
    updateFiltersState();

    document.querySelectorAll('.card_price_group').forEach(group => {
        // 1) Placeholder
        const placeholder = group.querySelector('[data-role="price-placeholder"]');
        if (placeholder) placeholder.style.display = slug ? 'none' : 'block';
  
        // 2–3) Show only the matching franchise block; hide others and toggle fs-list-field on their price
        group.querySelectorAll('.local_price').forEach(div => {
          const blockSlug = div.getAttribute('data-franchise-slug') || '';
          const priceEl = div.querySelector('[js-price="value"]');
          if (blockSlug === slug) {
            div.style.display = 'block';
          } else {
            div.style.display = 'none';
          }
        });

        // 4) Update price-filter-target
        const target = group.querySelector('.price-filter-target');
        if (!target) return;
      
        let priceText = '-1';
        if (slug) {
            const priceEl = group.querySelector(`.local_price[data-franchise-slug="${slug}"] [js-price="value"]`);
            if (priceEl) {
                priceText = priceEl.textContent.trim();
            }
        }
        target.textContent = priceText;
    });

    if (listInst) {
      listInst.applyFilters();
    }
  }

  // When the user picks a location radio...
  document.addEventListener('change', function(e){
    const tgt = e.target;
    if (!tgt.matches('input[name="location"], input[name="location-drawer"]')) return;
    const slug = tgt.dataset.franchiseSlug || '';
    updatePricesForSlug(slug);
  });

  // On initial load, strip location attributes first, then trigger for whichever is already checked (or none → slug = '')
  document.addEventListener('DOMContentLoaded', () => {
    updateFiltersState();
    const sel = document.querySelector('input[name="location"]:checked, input[name="location-drawer"]:checked');
    const slug = sel ? (sel.dataset.franchiseSlug || '') : '';
    updatePricesForSlug(slug);
  });
})(); 
</script>