"use strict";

// Global state
const state = {
  isSorting: false,
  isPaused: false,
  currentAlgorithm: null,
  array: [],
  originalArray: [],
  comparisons: 0,
  swaps: 0,
  startTime: 0,
  settings: {
    soundEnabled: true,
    animationsEnabled: true,
    showValues: false,
    colorTheme: 'default'
  }
};

// Audio context for sound effects
let audioContext;
let oscillator;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  
  // Fallback: Hide loading screen after 2 seconds regardless
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 2000); // Reduced from 3000ms to 2000ms
});

async function initializeApp() {
  try {
    // Initialize particles (with error handling)
    initializeParticles();
    
    // Initialize audio context
    initializeAudio();
    
    // Initialize UI
    initializeUI();
    
    // Generate initial array
    await generateArray();
    
    // Hide loading screen after a shorter delay
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    }, 1000); // Reduced to 1000ms for faster loading
    
  } catch (error) {
    console.error('Error initializing app:', error);
    // Hide loading screen even if there's an error
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    }, 500);
  }
}

// Particle system initialization with error handling
function initializeParticles() {
  try {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: 50, // Reduced for better performance
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: '#ffffff'
          },
          shape: {
            type: 'circle'
          },
          opacity: {
            value: 0.3, // Reduced opacity
            random: false
          },
          size: {
            value: 2, // Smaller particles
            random: true
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.2, // Reduced opacity
            width: 1
          },
          move: {
            enable: true,
            speed: 1, // Slower movement
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: false // Disabled for better performance
            },
            onclick: {
              enable: false // Disabled for better performance
            },
            resize: true
          }
        },
        retina_detect: false // Disabled for better performance
      });
    } else {
      console.warn('particlesJS not loaded, skipping particle initialization');
      // Create a simple fallback background
      const particlesContainer = document.getElementById('particles-js');
      if (particlesContainer) {
        particlesContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        particlesContainer.style.opacity = '0.1';
      }
    }
  } catch (error) {
    console.error('Error initializing particles:', error);
    // Create a simple fallback background
    const particlesContainer = document.getElementById('particles-js');
    if (particlesContainer) {
      particlesContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      particlesContainer.style.opacity = '0.1';
    }
  }
}

// Audio initialization
function initializeAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log('Web Audio API not supported');
  }
}

// Play sound effect
function playSound(frequency = 440, duration = 0.1) {
  if (!state.settings.soundEnabled || !audioContext) return;
  
  try {
    oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.log('Audio playback failed');
  }
}

// UI initialization
function initializeUI() {
  // Event listeners
  document.getElementById('generate-btn').addEventListener('click', generateArray);
  document.getElementById('sort-btn').addEventListener('click', startSorting);
  document.getElementById('pause-btn').addEventListener('click', togglePause);
  document.getElementById('reset-btn').addEventListener('click', resetArray);
  document.getElementById('export-btn').addEventListener('click', exportData);
  
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  // Modal controls
  document.getElementById('settings-btn').addEventListener('click', () => showModal('settings-modal'));
  document.getElementById('tutorial-btn').addEventListener('click', () => showModal('tutorial-modal'));
  document.getElementById('settings-close').addEventListener('click', () => hideModal('settings-modal'));
  document.getElementById('tutorial-close').addEventListener('click', () => hideModal('tutorial-modal'));
  
  // Settings controls
  document.getElementById('sound-toggle').addEventListener('change', updateSettings);
  document.getElementById('animation-toggle').addEventListener('change', updateSettings);
  document.getElementById('values-toggle').addEventListener('change', updateSettings);
  document.getElementById('color-theme').addEventListener('change', updateSettings);
  
  // Algorithm selection
  document.getElementById('algorithm-select').addEventListener('change', updateAlgorithmInfo);
  
  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal(modal.id);
      }
    });
  });
  
  // Initialize algorithm info
  updateAlgorithmInfo();
}

// Generate new array
async function generateArray() {
  const size = parseInt(document.getElementById('size-select').value);
  state.array = generateRandomArray(size);
  state.originalArray = [...state.array];
  
  await renderArray();
  resetMetrics();
  
  playSound(523.25); // C note
}

// Generate random array
function generateRandomArray(size) {
  const array = [];
  for (let i = 0; i < size; i++) {
    array.push(Math.floor(Math.random() * 100) + 1);
  }
  return array;
}

// Render array visualization
async function renderArray() {
  const arrayContainer = document.getElementById('array');
  arrayContainer.innerHTML = '';
  
  const maxValue = Math.max(...state.array);
  const containerHeight = 350;
  
  state.array.forEach((value, index) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.setAttribute('data-value', value);
    cell.style.height = `${(value / maxValue) * containerHeight}px`;
    cell.style.width = `${100 / state.array.length - 0.5}%`;
    
    if (state.settings.showValues) {
      cell.classList.add('show-value');
    }
    
    arrayContainer.appendChild(cell);
  });
}

// Start sorting
async function startSorting() {
  const algorithm = document.getElementById('algorithm-select').value;
  
  if (!algorithm) {
    showNotification('Please select an algorithm first!', 'error');
    return;
  }
  
  if (state.isSorting) {
    showNotification('Sorting already in progress!', 'error');
    return;
  }

  state.isSorting = true;
  state.isPaused = false;
  state.comparisons = 0;
  state.swaps = 0;
  state.startTime = performance.now();
  
  // Update UI
  document.getElementById('sort-btn').disabled = true;
  document.getElementById('pause-btn').disabled = false;
  document.getElementById('generate-btn').disabled = true;
  
  try {
    const sortAlgo = new SortAlgorithms(state.settings);
    
    switch (algorithm) {
      case 'bubble':
        await sortAlgo.bubbleSort();
        break;
      case 'selection':
        await sortAlgo.selectionSort();
        break;
      case 'insertion':
        await sortAlgo.insertionSort();
        break;
      case 'merge':
        await sortAlgo.mergeSort();
        break;
      case 'quick':
        await sortAlgo.quickSort();
        break;
      case 'heap':
        await sortAlgo.heapSort();
        break;
      case 'radix':
        await sortAlgo.radixSort();
        break;
      case 'shell':
        await sortAlgo.shellSort();
        break;
    }
    
    // Mark all as sorted
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.classList.add('sorted');
    });
    
    showNotification('Array sorted successfully!', 'success');
    playSound(659.25); // E note for completion
    
  } catch (error) {
    console.error('Sorting error:', error);
    showNotification('An error occurred during sorting!', 'error');
  } finally {
    state.isSorting = false;
    document.getElementById('sort-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('generate-btn').disabled = false;
  }
}

// Toggle pause
function togglePause() {
  state.isPaused = !state.isPaused;
  const pauseBtn = document.getElementById('pause-btn');
  
  if (state.isPaused) {
    pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    playSound(493.88); // B note
  } else {
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    playSound(523.25); // C note
  }
}

// Reset array
async function resetArray() {
  state.array = [...state.originalArray];
  await renderArray();
  resetMetrics();
  
  playSound(440); // A note
}

// Export data
function exportData() {
  const data = {
    algorithm: document.getElementById('algorithm-select').value,
    arraySize: state.array.length,
    originalArray: state.originalArray,
    sortedArray: state.array,
    metrics: {
      comparisons: state.comparisons,
      swaps: state.swaps,
      time: performance.now() - state.startTime
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sortify-data.json';
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification('Data exported successfully!', 'success');
}

// Theme toggle
function toggleTheme() {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const icon = themeToggle.querySelector('i');
  
  if (html.getAttribute('data-theme') === 'dark') {
    html.setAttribute('data-theme', 'light');
    icon.className = 'fas fa-sun';
  } else {
    html.setAttribute('data-theme', 'dark');
    icon.className = 'fas fa-moon';
  }
  
  playSound(554.37); // C# note
}

// Update settings
function updateSettings() {
  state.settings.soundEnabled = document.getElementById('sound-toggle').checked;
  state.settings.animationsEnabled = document.getElementById('animation-toggle').checked;
  state.settings.showValues = document.getElementById('values-toggle').checked;
  state.settings.colorTheme = document.getElementById('color-theme').value;
  
  // Update array display
  if (state.settings.showValues) {
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.add('show-value');
    });
  } else {
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('show-value');
    });
  }
  
  playSound(587.33); // D note
}

// Update algorithm info
function updateAlgorithmInfo() {
  const algorithm = document.getElementById('algorithm-select').value;
  const algorithmInfo = getAlgorithmInfo(algorithm);
  
  document.getElementById('algorithm-name').textContent = algorithmInfo.name;
  document.getElementById('algorithm-description').textContent = algorithmInfo.description;
  document.getElementById('time-complexity').textContent = algorithmInfo.timeComplexity;
  document.getElementById('space-complexity').textContent = algorithmInfo.spaceComplexity;
  document.getElementById('complexity').textContent = algorithmInfo.timeComplexity;
}

// Get algorithm information
function getAlgorithmInfo(algorithm) {
  const algorithms = {
    bubble: {
      name: 'Bubble Sort',
      description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    selection: {
      name: 'Selection Sort',
      description: 'An in-place comparison sorting algorithm that divides the input list into two parts: a sorted sublist and an unsorted sublist.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    insertion: {
      name: 'Insertion Sort',
      description: 'A simple sorting algorithm that builds the final sorted array one item at a time by repeatedly inserting a new element into the sorted portion.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    merge: {
      name: 'Merge Sort',
      description: 'A divide-and-conquer algorithm that recursively breaks down a problem into two or more sub-problems until they become simple enough to solve.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)'
    },
    quick: {
      name: 'Quick Sort',
      description: 'A highly efficient, comparison-based sorting algorithm that uses a divide-and-conquer strategy to sort elements.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(log n)'
    },
    heap: {
      name: 'Heap Sort',
      description: 'A comparison-based sorting algorithm that uses a binary heap data structure to sort elements.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)'
    },
    radix: {
      name: 'Radix Sort',
      description: 'A non-comparative integer sorting algorithm that sorts data with integer keys by grouping keys by the individual digits.',
      timeComplexity: 'O(nk)',
      spaceComplexity: 'O(n+k)'
    },
    shell: {
      name: 'Shell Sort',
      description: 'An optimization of insertion sort that allows the exchange of items that are far apart, reducing the number of swaps required.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)'
    }
  };
  
  return algorithms[algorithm] || {
    name: 'Select an Algorithm',
    description: 'Choose a sorting algorithm to see its description and complexity analysis.',
    timeComplexity: '-',
    spaceComplexity: '-'
  };
}

// Update metrics
function updateMetrics() {
  document.getElementById('comparisons').textContent = state.comparisons;
  document.getElementById('swaps').textContent = state.swaps;
  
  if (state.startTime > 0) {
    const elapsed = Math.round(performance.now() - state.startTime);
    document.getElementById('time').textContent = `${elapsed}ms`;
  }
}

// Reset metrics
function resetMetrics() {
  state.comparisons = 0;
  state.swaps = 0;
  state.startTime = 0;
  updateMetrics();
}

// Show modal
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('active');
  playSound(523.25); // C note
}

// Hide modal
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('active');
  playSound(440); // A note
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.getElementById('success-notification');
  const content = notification.querySelector('span');
  const icon = notification.querySelector('i');
  
  content.textContent = message;
  
  if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    icon.className = 'fas fa-exclamation-circle';
  } else {
    notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    icon.className = 'fas fa-check-circle';
  }
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Wait function with pause support
function wait(ms) {
  return new Promise(resolve => {
    const checkPause = () => {
      if (state.isPaused) {
        setTimeout(checkPause, 100);
      } else {
        setTimeout(resolve, ms);
      }
    };
    checkPause();
  });
}

// Export functions for use in other modules
window.state = state;
window.updateMetrics = updateMetrics;
window.wait = wait;
window.playSound = playSound;
