import { useState, useEffect } from 'react';
import { 
  Sun, Moon, Settings, Sliders, Copy, Save, FileText, Sparkles, 
  Trash2, RotateCcw, Download
} from 'lucide-react';
import type { FormInputs, DesignSettings, HistoryLogItem } from './types';
import { 
  PHOTO_REPO, DEFAULT_POSTER_PROMPT, DEFAULT_CAROUSEL_PROMPT, 
  INITIAL_FORM_INPUTS, INITIAL_DESIGN_SETTINGS 
} from './constants';

function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme_engine');
    return saved === 'light' ? 'light' : 'dark';
  });

  // App engine mode
  const [engineMode, setEngineMode] = useState<'poster' | 'carousel'>('poster');
  
  // Tabs states
  const [sidebarTab, setSidebarTab] = useState<'content' | 'design'>('content');
  const [promptTab, setPromptTab] = useState<'master' | 'imagen'>('master');
  const [carouselActiveIndex, setCarouselActiveIndex] = useState<number>(0);

  // Form Inputs & Design Settings
  const [formInputs, setFormInputs] = useState<FormInputs>(INITIAL_FORM_INPUTS);
  const [designSettings, setDesignSettings] = useState<DesignSettings>(INITIAL_DESIGN_SETTINGS);

  // Custom Prompt Templates
  const [customPosterTemplate, setCustomPosterTemplate] = useState<string>(() => {
    return localStorage.getItem('custom_poster_template_v52') || DEFAULT_POSTER_PROMPT;
  });
  const [customCarouselTemplate, setCustomCarouselTemplate] = useState<string>(() => {
    return localStorage.getItem('custom_carousel_template_v53') || DEFAULT_CAROUSEL_PROMPT;
  });

  // History & Toasts
  const [historyLogs, setHistoryLogs] = useState<HistoryLogItem[]>(() => {
    const raw = localStorage.getItem('content_engine_history_logs_v53');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Modals state
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);
  const [editingTemplateMode, setEditingTemplateMode] = useState<'poster' | 'carousel'>('poster');
  const [tempTemplateText, setTempTemplateText] = useState<string>('');

  // Live Compiled Prompt state
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');

  // Sync dark class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_engine', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_engine', 'light');
    }
  }, [theme]);

  // Show Toast helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // Preset Applier
  const applyPreset = (presetType: 'stress' | 'relief' | 'workplace') => {
    setFormInputs(prev => {
      const updated = { ...prev };
      if (presetType === 'stress') {
        updated.headline = "Kerja Keras Saja Tidak Cukup Tanpa Kepastian Finansial";
        updated.highlight = "Kepastian Finansial";
        updated.support = "Akses gaji instan kapan saja tanpa beban bunga tinggi.";
        updated.cta = "Tarik Gaji Hari Ini";
        updated.emotion = "stress";
        updated.context = "salary access";
        updated.heroMode = "SMARTPHONE";
        updated.carouselHeadline = "Gaji Habis Tengah Bulan Padahal Kerja Lembur?";
        updated.carouselHighlight = "Gaji Habis";
        updated.carouselSupport = "Mengatasi stres finansial karyawan dengan kemudahan tarik gaji lebih awal secara ramah.";
        updated.carouselCta = "Tarik Gaji Hari Ini";
        setDesignSettings(ds => ({ ...ds, mockupPhoto: 'corporate-stress' }));
      } else if (presetType === 'relief') {
        updated.headline = "Senyum Tenang Karyawan Adalah Pondasi Sukses Perusahaan";
        updated.highlight = "Senyum Tenang Karyawan";
        updated.support = "Kurangi beban kasbon dengan platform Earned Wage Access modern.";
        updated.cta = "Pelajari Kesejahteraan";
        updated.emotion = "relief";
        updated.context = "financial wellbeing";
        updated.heroMode = "WORKSPACE";
        updated.carouselHeadline = "Pondasi Ketenangan Kerja Dimulai dari Kesejahteraan Finansial";
        updated.carouselHighlight = "Ketenangan Kerja";
        updated.carouselSupport = "Berikan kesejahteraan terbaik bagi karyawan Anda melalui platform EWA modern Arus.id.";
        updated.carouselCta = "Pelajari Kesejahteraan";
        setDesignSettings(ds => ({ ...ds, mockupPhoto: 'modern-office' }));
      } else {
        updated.headline = "Kembalikan Produktivitas Terbaik Tanpa Beban Tagihan Tengah Bulan";
        updated.highlight = "Produktivitas Terbaik";
        updated.support = "Program Employee Benefit yang melindungi ketenangan kerja harian tim.";
        updated.cta = "Demo Platform Arus";
        updated.emotion = "hope";
        updated.context = "employee benefit";
        updated.heroMode = "HUMAN";
        updated.carouselHeadline = "Bebaskan Karyawan dari Beban Tagihan Finansial Tengah Bulan";
        updated.carouselHighlight = "Bebaskan Karyawan";
        updated.carouselSupport = "Melindungi ketenangan dan produktivitas tim harian Anda lewat program benefit finansial.";
        updated.carouselCta = "Demo Platform Arus";
        setDesignSettings(ds => ({ ...ds, mockupPhoto: 'jakarta-commuter' }));
      }

      // Sync slide 1 with global carousel inputs if in carousel mode
      if (engineMode === 'carousel') {
        updated.carouselSlides = [...updated.carouselSlides];
        updated.carouselSlides[0] = {
          headline: updated.carouselHeadline,
          support: updated.carouselSupport
        };
      }
      return updated;
    });

    showToast(`Applied ${presetType.toUpperCase()} Campaign Preset!`);
  };

  // Compiles prompt string based on state variables
  useEffect(() => {
    let outputText = "";
    if (engineMode === 'poster') {
      if (promptTab === 'master') {
        let compiled = customPosterTemplate;
        compiled = compiled.split('{{headline}}').join(`"${formInputs.headline}"`);
        compiled = compiled.split('{{support_text}}').join(`"${formInputs.support}"`);
        compiled = compiled.split('{{cta}}').join(`"${formInputs.cta}"`);
        compiled = compiled.split('{{emotion_core}}').join(formInputs.emotion.toUpperCase());
        compiled = compiled.split('{{campaign_context}}').join(formInputs.context.toUpperCase());
        compiled = compiled.split('{{typography_style}}').join(formInputs.typography.toUpperCase());
        compiled = compiled.split('{{hero_mode}}').join(formInputs.heroMode);
        compiled = compiled.split('{{selected_hero_configuration}}').join(formInputs.heroConfig);
        compiled = compiled.split('{{team_mood_direction}}').join(formInputs.teamMoodDir);
        compiled = compiled.split('{{background_mood}}').join(formInputs.bgMood);
        outputText = compiled;
      } else {
        outputText = `Premium social media poster photo background for Arus.id fintech campaign.
Visual Human Moment: ${formInputs.heroConfig}, set in an emotional environment of [EMOTION: ${formInputs.emotion.toUpperCase()}].
Team Dynamic Context: ${formInputs.teamMoodDir}
Background Atmosphere: ${formInputs.bgMood}
Composition Direction: cinematic shot, shallow depth-of-field, asymmetric workspace framing, ultra-high dynamic range, 3:4 aspect ratio.
Brand Color Accent: Muted neutrals and dark green tone background (#1b4c4a) with subtle emerald green highlights (#4fc58c) ambient lighting.`;
      }
    } else {
      if (promptTab === 'master') {
        let compiled = customCarouselTemplate;
        compiled = compiled.split('{{CAROUSEL_HEADLINE}}').join(`"${formInputs.carouselHeadline}"`);
        compiled = compiled.split('{{CAROUSEL_CONTEXT}}').join(formInputs.context.toUpperCase());
        compiled = compiled.split('{{CAROUSEL_EMOTION}}').join(formInputs.emotion.toUpperCase());
        compiled = compiled.split('{{CAROUSEL_SUPPORT}}').join(`"${formInputs.carouselSupport}"`);
        compiled = compiled.split('{{CAROUSEL_CTA}}').join(`"${formInputs.carouselCta}"`);
        
        compiled = compiled.split('{{SLIDE1_HEADLINE}}').join(`"${formInputs.carouselSlides[0]?.headline || ''}"`);
        compiled = compiled.split('{{SLIDE1_SUPPORT}}').join(`"${formInputs.carouselSlides[0]?.support || ''}"`);
        compiled = compiled.split('{{SLIDE2_HEADLINE}}').join(`"${formInputs.carouselSlides[1]?.headline || ''}"`);
        compiled = compiled.split('{{SLIDE2_SUPPORT}}').join(`"${formInputs.carouselSlides[1]?.support || ''}"`);
        compiled = compiled.split('{{SLIDE3_HEADLINE}}').join(`"${formInputs.carouselSlides[2]?.headline || ''}"`);
        compiled = compiled.split('{{SLIDE3_SUPPORT}}').join(`"${formInputs.carouselSlides[2]?.support || ''}"`);
        compiled = compiled.split('{{SLIDE4_HEADLINE}}').join(`"${formInputs.carouselSlides[3]?.headline || ''}"`);
        compiled = compiled.split('{{SLIDE4_SUPPORT}}').join(`"${formInputs.carouselSlides[3]?.support || ''}"`);
        compiled = compiled.split('{{SLIDE5_HEADLINE}}').join(`"${formInputs.carouselSlides[4]?.headline || ''}"`);
        compiled = compiled.split('{{SLIDE5_SUPPORT}}').join(`"${formInputs.carouselSlides[4]?.support || ''}"`);
        outputText = compiled;
      } else {
        outputText = `Premium 5-slide visual carousel asset background sequence for Arus.id campaign.
Story Theme: Reverse financial breakthrough narrative of 1 urban Indonesian modern worker.
Visual Arc (Slide 1-5):
- Slide 1 (Aspirational): Crisp clear sunlight, hero standing in lobby.
- Slide 2 (Challenge Stressed): Moody shadows, tired sitting, messy workspace.
- Slide 3 (Challenge Focused): Low neon UI light, distracted by smartphone screen.
- Slide 4 (Solution Clean): Clear morning rays, professional starting fresh.
- Slide 5 (Resolution Victory): Joyful and relieved, walking in premium business environment.
Technical constraints: Cinematic portrait frame, 3:4 aspect ratio, ultra-premium glassmorphism UI overlay components in focus.`;
      }
    }
    setCompiledPrompt(outputText);
  }, [formInputs, designSettings, engineMode, promptTab, customPosterTemplate, customCarouselTemplate]);

  // Lock team mood selector if configuration A is selected
  useEffect(() => {
    if (formInputs.heroConfig.includes("CONFIGURATION A")) {
      setFormInputs(prev => ({
        ...prev,
        teamMoodDir: "NOT APPLICABLE: - (Only use this if Configuration A is selected)"
      }));
    } else if (formInputs.teamMoodDir.includes("NOT APPLICABLE")) {
      setFormInputs(prev => ({
        ...prev,
        teamMoodDir: "STRESS & ANXIETY CONTEXT: A modern tech-office room where 3-4 team members look visibly quiet, mentally overloaded, and distracted; one is rubbing their temples, another staring blankly at a laptop screen, capturing a unified atmosphere of subtle workplace pressure."
      }));
    }
  }, [formInputs.heroConfig]);

  // Synchronize first slide text editor and global carousel variables
  const handleGlobalCarouselTextChange = (field: 'headline' | 'support' | 'cta' | 'highlight', value: string) => {
    setFormInputs(prev => {
      const updated = { ...prev };
      if (field === 'headline') {
        updated.carouselHeadline = value;
        updated.carouselSlides = [...updated.carouselSlides];
        updated.carouselSlides[0] = { ...updated.carouselSlides[0], headline: value };
      } else if (field === 'support') {
        updated.carouselSupport = value;
        updated.carouselSlides = [...updated.carouselSlides];
        updated.carouselSlides[0] = { ...updated.carouselSlides[0], support: value };
      } else if (field === 'cta') {
        updated.carouselCta = value;
      } else if (field === 'highlight') {
        updated.carouselHighlight = value;
      }
      return updated;
    });
  };

  const handleSlideContentChange = (index: number, field: 'headline' | 'support', value: string) => {
    setFormInputs(prev => {
      const updated = { ...prev };
      updated.carouselSlides = [...updated.carouselSlides];
      updated.carouselSlides[index] = { ...updated.carouselSlides[index], [field]: value };
      
      // If updating slide 0, keep global variables in sync
      if (index === 0) {
        if (field === 'headline') updated.carouselHeadline = value;
        if (field === 'support') updated.carouselSupport = value;
      }
      return updated;
    });
  };

  // Clipboard Copier
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(compiledPrompt);
        showToast("Prompt Copied to Clipboard!");
      } else {
        fallbackCopyText(compiledPrompt);
      }
    } catch (err) {
      fallbackCopyText(compiledPrompt);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const success = document.execCommand('copy');
      if (success) {
        showToast("Prompt Copied to Clipboard!");
      } else {
        showToast("Copy failed, please copy manually.");
      }
    } catch (e) {
      showToast("Copy failed, please copy manually.");
    }
    document.body.removeChild(textArea);
  };

  // History Operations
  const saveToHistory = () => {
    const descriptiveHeadline = engineMode === 'poster' ? formInputs.headline : `Carousel: ${formInputs.carouselHeadline}`;
    
    const newLogItem: HistoryLogItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      headline: descriptiveHeadline,
      mode: engineMode,
      emotion: formInputs.emotion.toUpperCase(),
      promptText: compiledPrompt,
      savedState: {
        engineMode,
        formInputs: JSON.parse(JSON.stringify(formInputs)),
        designSettings: JSON.parse(JSON.stringify(designSettings))
      }
    };

    const updated = [newLogItem, ...historyLogs];
    setHistoryLogs(updated);
    localStorage.setItem('content_engine_history_logs_v53', JSON.stringify(updated));
    showToast("Prompt Log Saved to History!");
  };

  const copyHistoryPrompt = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast("Prompt Copied to Clipboard!");
      } else {
        fallbackCopyText(text);
      }
    } catch (e) {
      fallbackCopyText(text);
    }
  };

  const restoreHistoryState = (item: HistoryLogItem) => {
    const state = item.savedState;
    setEngineMode(state.engineMode);
    setFormInputs(JSON.parse(JSON.stringify(state.formInputs)));
    setDesignSettings(JSON.parse(JSON.stringify(state.designSettings)));
    if (state.engineMode === 'carousel') {
      setCarouselActiveIndex(0);
    }
    showToast("Form State Restored Successfully!");
  };

  const deleteHistoryItem = (id: number) => {
    const updated = historyLogs.filter(i => i.id !== id);
    setHistoryLogs(updated);
    localStorage.setItem('content_engine_history_logs_v53', JSON.stringify(updated));
    showToast("History Item Removed.");
  };

  const clearAllHistory = () => {
    setHistoryLogs([]);
    localStorage.removeItem('content_engine_history_logs_v53');
    setShowConfirmClear(false);
    showToast("All Prompt Log History Cleared!");
  };

  // Custom Templates Modal operations
  const openTemplateEditor = () => {
    setEditingTemplateMode(engineMode);
    setTempTemplateText(engineMode === 'poster' ? customPosterTemplate : customCarouselTemplate);
    setShowTemplateEditor(true);
  };

  const saveCustomTemplate = () => {
    if (editingTemplateMode === 'poster') {
      setCustomPosterTemplate(tempTemplateText);
      localStorage.setItem('custom_poster_template_v52', tempTemplateText);
    } else {
      setCustomCarouselTemplate(tempTemplateText);
      localStorage.setItem('custom_carousel_template_v53', tempTemplateText);
    }
    setShowTemplateEditor(false);
    showToast("Base System Template Updated!");
  };

  const resetTemplateToDefault = () => {
    if (window.confirm("Restore this template to original default? Your custom changes will be deleted.")) {
      if (editingTemplateMode === 'poster') {
        setTempTemplateText(DEFAULT_POSTER_PROMPT);
      } else {
        setTempTemplateText(DEFAULT_CAROUSEL_PROMPT);
      }
      showToast("Template reset to original standard layout.");
    }
  };

  // Canvas Exporter Engine
  const renderHighResPosterExport = () => {
    showToast("Generating High-Resolution Canvas Export... Please wait.");

    let activeHeadline = "";
    let activeSupport = "";
    let activeCta = "";
    let activeHighlight = "";

    if (engineMode === 'poster') {
      activeHeadline = formInputs.headline;
      activeSupport = formInputs.support;
      activeCta = formInputs.cta;
      activeHighlight = formInputs.highlight;
    } else {
      const currentSlide = formInputs.carouselSlides[carouselActiveIndex];
      activeHeadline = currentSlide?.headline || "";
      activeSupport = currentSlide?.support || "";
      activeCta = formInputs.carouselCta;
      activeHighlight = formInputs.carouselHighlight;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load background image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = PHOTO_REPO[designSettings.mockupPhoto];
    
    img.onload = () => {
      // Draw background
      ctx.drawImage(img, 0, 0, 1200, 1600);

      // Dark vs Light gradient blend
      const isDarkState = engineMode === 'poster' || (carouselActiveIndex === 1 || carouselActiveIndex === 2);
      const grad = ctx.createLinearGradient(0, 0, 0, 1600);
      
      if (isDarkState) {
        grad.addColorStop(0, 'rgba(11, 22, 21, 0.4)');
        grad.addColorStop(0.5, 'rgba(11, 22, 21, 0.7)');
        grad.addColorStop(1, 'rgba(11, 22, 21, 0.98)');
      } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 1600);

      // Backdrop custom panel configuration
      const panelY = (designSettings.layoutY / 100) * 1600;
      const panelHeight = 440;
      const panelX = 50;
      const panelWidth = 1100;

      ctx.save();
      ctx.fillStyle = isDarkState ? "rgba(11, 22, 21, 0.85)" : "rgba(255, 255, 255, 0.9)";
      ctx.strokeStyle = "rgba(79, 197, 140, 0.3)";
      ctx.lineWidth = 3;
      
      // Draw rounded panel path
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 30);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Draw Logo watermark / Header inside panel
      ctx.fillStyle = isDarkState ? "#94a3b8" : "#475569";
      ctx.font = "bold 20px 'Plus Jakarta Sans'";
      
      // Align logo drawing based on selection
      let logoX = panelX + 40;
      ctx.textAlign = "left";
      if (designSettings.logoAlign === 'center') {
        logoX = panelX + (panelWidth / 2);
        ctx.textAlign = "center";
      } else if (designSettings.logoAlign === 'right') {
        logoX = panelX + panelWidth - 40;
        ctx.textAlign = "right";
      }
      ctx.fillText("A R U S . I D  C A M P A I G N", logoX, panelY + 60);

      // Reset align for text drawing
      ctx.textAlign = "left";

      // Draw Main Headline inside panel
      ctx.font = `bold ${designSettings.headlineSize * 1.3}px Roboto`;
      const wordsY = panelY + 140;
      wrapText(ctx, activeHeadline, panelX + 40, wordsY, 1020, designSettings.headlineSize * 1.5, activeHighlight, isDarkState);

      // Draw Support Text inside panel
      ctx.font = `500 ${designSettings.supportSize * 1.5}px 'Plus Jakarta Sans'`;
      ctx.fillStyle = isDarkState ? "#cbd5e1" : "#334155";
      ctx.fillText(activeSupport, panelX + 40, panelY + 310);

      // Draw Call To Action Button
      ctx.fillStyle = "#4fc58c";
      ctx.beginPath();
      ctx.roundRect(panelX + 40, panelY + 350, 300, 60, 15);
      ctx.fill();

      ctx.fillStyle = "#0b1615";
      ctx.font = "bold 22px 'Plus Jakarta Sans'";
      ctx.textAlign = "center";
      ctx.fillText(activeCta, panelX + 190, panelY + 388);

      // Trigger automatic file download link
      const link = document.createElement('a');
      link.download = `arus-content-engine-${engineMode}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.onerror = () => {
      showToast("Error loading Unsplash background image for export. Please try again.");
    };
  };

  const wrapText = (
    context: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number, 
    highlightWord: string, 
    isDarkState: boolean
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        drawLineWithHighlight(context, line, x, currentY, highlightWord, isDarkState);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    drawLineWithHighlight(context, line, x, currentY, highlightWord, isDarkState);
  };

  const drawLineWithHighlight = (
    context: CanvasRenderingContext2D, 
    lineText: string, 
    x: number, 
    y: number, 
    highlightWord: string, 
    isDarkState: boolean
  ) => {
    if (!highlightWord || !lineText.toLowerCase().includes(highlightWord.toLowerCase())) {
      context.fillStyle = isDarkState ? "#ffffff" : "#0f172a";
      context.fillText(lineText, x, y);
      return;
    }

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = lineText.split(new RegExp(`(${escapeRegExp(highlightWord)})`, 'gi'));
    let currentX = x;

    parts.forEach((part) => {
      if (part.toLowerCase() === highlightWord.toLowerCase()) {
        context.fillStyle = "#4fc58c";
      } else {
        context.fillStyle = isDarkState ? "#ffffff" : "#0f172a";
      }
      context.fillText(part, currentX, y);
      currentX += context.measureText(part).width;
    });
  };

  // Helper regex highlighter for HTML/React rendering
  const renderHeadlineWithHighlights = (text: string, highlight: string) => {
    if (!highlight || !text.toLowerCase().includes(highlight.toLowerCase())) {
      return text;
    }
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escaped = escapeRegExp(highlight);
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={index} className="text-brand-primary font-black">{part}</span>
        : part
    );
  };

  // Dynamic visual settings based on states
  const activeHeadline = engineMode === 'poster' ? formInputs.headline : formInputs.carouselSlides[carouselActiveIndex]?.headline || "";
  const activeSupport = engineMode === 'poster' ? formInputs.support : formInputs.carouselSlides[carouselActiveIndex]?.support || "";
  const activeCta = engineMode === 'poster' ? formInputs.cta : formInputs.carouselCta;
  const activeHighlight = engineMode === 'poster' ? formInputs.highlight : formInputs.carouselHighlight;

  const showSmartphoneAlert = engineMode === 'poster' 
    ? formInputs.heroMode === 'SMARTPHONE' 
    : true;

  const isSlideDarkTheme = engineMode === 'poster' || (carouselActiveIndex === 1 || carouselActiveIndex === 2);

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* TOP HEADER BAR */}
      <header className="border-b border-slate-200 dark:border-brand-dark/30 bg-white/80 dark:bg-brand-obsidian/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-brand-obsidian" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M2 17l6-6 4 4 10-10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5h5v5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                Content Engine
                <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20 font-bold">V5.3 PRO</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">Premium Single Poster & 5-Slide Campaign Carousel Studio</p>
            </div>
          </div>

          {/* ENGINE MODE SELECTOR SWITCH */}
          <div className="relative z-10 flex bg-slate-100 dark:bg-brand-dark/20 p-1 rounded-xl border border-slate-200 dark:border-brand-dark/30 shadow-inner">
            <button 
              onClick={() => setEngineMode('poster')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                engineMode === 'poster'
                  ? 'bg-white dark:bg-brand-primary text-brand-dark dark:text-brand-obsidian shadow' 
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Single Poster
            </button>
            <button 
              onClick={() => setEngineMode('carousel')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                engineMode === 'carousel'
                  ? 'bg-white dark:bg-brand-primary text-brand-dark dark:text-brand-obsidian shadow' 
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              5-Slide Carousel
            </button>
          </div>

          {/* SYSTEM SETTINGS & THEME */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition" 
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => showToast("Content Engine settings are locked for Arus.id brand specifications.")} 
              className="flex items-center gap-2 bg-slate-900 text-white dark:bg-brand-primary dark:text-brand-obsidian font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg hover:opacity-90 transition"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR LEFT: CONTROLS & FORM */}
        <section className="lg:col-span-5 flex flex-col gap-6 lg:max-h-[82vh] lg:overflow-y-auto pr-2 pb-12">
          
          {/* MULTI-TAB WORKSPACE SWITCHER */}
          <div className="flex border-b border-slate-200 dark:border-brand-dark/30">
            <button 
              onClick={() => setSidebarTab('content')} 
              className={`flex-1 pb-3 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition ${
                sidebarTab === 'content' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Content & Prompts
            </button>
            <button 
              onClick={() => setSidebarTab('design')} 
              className={`flex-1 pb-3 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition ${
                sidebarTab === 'design' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Design & Branding
            </button>
          </div>

          {/* TAB 1: CONTENT CONTROLS */}
          {sidebarTab === 'content' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* PRESET CARD */}
              <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-brand-dark/20 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-brand-primary">Campaign Presets</h2>
                  <span className="text-xs bg-slate-100 dark:bg-brand-dark/30 text-slate-500 dark:text-brand-primary/80 px-2 py-0.5 rounded">Quick Start</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button 
                    onClick={() => applyPreset('stress')} 
                    className="px-3 py-2 text-left rounded-xl bg-slate-50 dark:bg-brand-dark/10 hover:bg-brand-primary/10 hover:text-brand-dark dark:hover:text-brand-primary border border-slate-200/50 dark:border-brand-dark/20 transition group"
                  >
                    <span className="block text-xs font-bold text-slate-600 dark:text-gray-300 group-hover:text-brand-primary">Salary Anxiety</span>
                    <span className="block text-[10px] text-slate-400 truncate">Stress & pressure relief</span>
                  </button>
                  <button 
                    onClick={() => applyPreset('relief')} 
                    className="px-3 py-2 text-left rounded-xl bg-slate-50 dark:bg-brand-dark/10 hover:bg-brand-primary/10 hover:text-brand-dark dark:hover:text-brand-primary border border-slate-200/50 dark:border-brand-dark/20 transition group"
                  >
                    <span className="block text-xs font-bold text-slate-600 dark:text-gray-300 group-hover:text-brand-primary">Financial Freedom</span>
                    <span className="block text-[10px] text-slate-400 truncate">Hope & relief focus</span>
                  </button>
                  <button 
                    onClick={() => applyPreset('workplace')} 
                    className="px-3 py-2 text-left rounded-xl bg-slate-50 dark:bg-brand-dark/10 hover:bg-brand-primary/10 hover:text-brand-dark dark:hover:text-brand-primary border border-slate-200/50 dark:border-brand-dark/20 transition group"
                  >
                    <span className="block text-xs font-bold text-slate-600 dark:text-gray-300 group-hover:text-brand-primary">HR Benefits</span>
                    <span className="block text-[10px] text-slate-400 truncate">Wellness & balance</span>
                  </button>
                </div>
              </div>

              {/* SECTION COPY & META DETAILS */}
              <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-brand-dark/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-dark/10 pb-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-brand-primary">Campaign Copy & Meta</h2>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    engineMode === 'poster' 
                      ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' 
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {engineMode === 'poster' ? 'POSTER MODE' : '5-SLIDE CAROUSEL'}
                  </span>
                </div>

                {/* POSTER-SPECIFIC GLOBAL COPY INPUTS */}
                {engineMode === 'poster' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">MAIN HEADLINE</label>
                      <input 
                        type="text" 
                        value={formInputs.headline} 
                        onChange={(e) => setFormInputs(prev => ({ ...prev, headline: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">HIGHLIGHT KEYWORD (Green Highlight)</label>
                      <input 
                        type="text" 
                        value={formInputs.highlight} 
                        onChange={(e) => setFormInputs(prev => ({ ...prev, highlight: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                        placeholder="Word to highlight in #4fc58c"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">SUPPORT TEXT</label>
                        <input 
                          type="text" 
                          value={formInputs.support} 
                          onChange={(e) => setFormInputs(prev => ({ ...prev, support: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">CTA TEXT</label>
                        <input 
                          type="text" 
                          value={formInputs.cta} 
                          onChange={(e) => setFormInputs(prev => ({ ...prev, cta: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                        />
                      </div>
                    </div>

                    {/* ADVANCED CAMERA HERO CONFIGURATION FOR SINGLE POSTER */}
                    <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-brand-dark/10">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary uppercase mb-1">Selected Hero Configuration</label>
                        <select 
                          value={formInputs.heroConfig} 
                          onChange={(e) => setFormInputs(prev => ({ ...prev, heroConfig: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                        >
                          <option value="CONFIGURATION A: INDIVIDUAL HERO (1 Person)">CONFIGURATION A: INDIVIDUAL HERO (1 Person)</option>
                          <option value="CONFIGURATION B: CO-WORKING HEROES (2 People - Peer Support)">CONFIGURATION B: CO-WORKING HEROES (2 People - Peer Support)</option>
                          <option value="CONFIGURATION C: TEAM WORKSPACE (3-4 People - Collective Mood)">CONFIGURATION C: TEAM WORKSPACE (3-4 People - Collective Mood)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary uppercase mb-1">Team Mood Direction</label>
                        <select 
                          value={formInputs.teamMoodDir} 
                          disabled={formInputs.heroConfig.includes("CONFIGURATION A")}
                          onChange={(e) => setFormInputs(prev => ({ ...prev, teamMoodDir: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition disabled:opacity-50"
                        >
                          {formInputs.heroConfig.includes("CONFIGURATION A") ? (
                            <option value="NOT APPLICABLE: - (Only use this if Configuration A is selected)">NOT APPLICABLE: (Only for Configuration A)</option>
                          ) : (
                            <>
                              <option value="STRESS & ANXIETY CONTEXT: A modern tech-office room where 3-4 team members look visibly quiet, mentally overloaded, and distracted; one is rubbing their temples, another staring blankly at a laptop screen, capturing a unified atmosphere of subtle workplace pressure.">STRESS & ANXIETY CONTEXT: Busy tech-office, overloaded team</option>
                              <option value="RELIEF & HOPE CONTEXT: A modern tech-office room with 3-4 team members collaborating casually, everyone looks relaxed, focused, and sharing a calm productive atmosphere (Unified Emotion of Relief).">RELIEF & HOPE CONTEXT: 3-4 members collaborating relaxed</option>
                              <option value="AMBITION & GROWTH CONTEXT: A dynamic premium workspace with 3-4 modern Indonesian professionals looking highly focused, aligned, and subtly energized while analyzing a screen together, showing quiet corporate confidence and collective ambition.">AMBITION & GROWTH CONTEXT: Dynamic focused workspace, aligned</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary uppercase mb-1">Background Mood</label>
                        <select 
                          value={formInputs.bgMood} 
                          onChange={(e) => setFormInputs(prev => ({ ...prev, bgMood: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                        >
                          <option value="STRESS / PRESSURE: Slightly messy workspace, unfinished work, dim cinematic lighting, realistic subtle clutter on desks, casting signs of mental pressure.">STRESS / PRESSURE: Messy, dim, realistic desk clutter</option>
                          <option value="WORKPLACE / PRODUCTIVITY: Premium modern office, clean workspace, active laptops, documents, professional desk setup, believable high-productivity atmosphere.">WORKPLACE / PRODUCTIVITY: Premium clean office, active laptops</option>
                          <option value="RELIEF / SOLUTION: Calmer environment, brighter and clean atmosphere, subtle organization cues, premium hopeful lighting with soft ambient green edge-glow.">RELIEF / SOLUTION: Calmer, brighter atmosphere, hopeful lighting</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CAROUSEL-SPECIFIC GLOBAL & SLIDE-BY-SLIDE CONTENT */
                  <div className="space-y-4">
                    <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-brand-dark/10">
                      <span className="block text-[10px] font-bold text-brand-primary uppercase tracking-wider">Global Carousel Variables</span>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">MAIN HEADLINE (Global / Slide 1)</label>
                        <input 
                          type="text" 
                          value={formInputs.carouselHeadline} 
                          onChange={(e) => handleGlobalCarouselTextChange('headline', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">HIGHLIGHT KEYWORD</label>
                          <input 
                            type="text" 
                            value={formInputs.carouselHighlight} 
                            onChange={(e) => handleGlobalCarouselTextChange('highlight', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">CTA TEXT</label>
                          <input 
                            type="text" 
                            value={formInputs.carouselCta} 
                            onChange={(e) => handleGlobalCarouselTextChange('cta', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">SUPPORT TEXT</label>
                        <textarea 
                          value={formInputs.carouselSupport} 
                          onChange={(e) => handleGlobalCarouselTextChange('support', e.target.value)}
                          rows={2} 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition resize-none"
                        />
                      </div>
                    </div>

                    {/* Slide Selector Buttons */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Configure Slide Contents (WYSIWYG)</span>
                      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                        {[0, 1, 2, 3, 4].map((idx) => (
                          <button 
                            key={idx}
                            type="button" 
                            onClick={() => setCarouselActiveIndex(idx)} 
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 ${
                              carouselActiveIndex === idx
                                ? 'bg-brand-primary text-brand-obsidian'
                                : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                          >
                            Slide {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Current slide values editor */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-brand-dark/10 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary uppercase mb-1">
                          Slide {carouselActiveIndex + 1} Headline
                        </label>
                        <input 
                          type="text" 
                          value={formInputs.carouselSlides[carouselActiveIndex]?.headline || ''} 
                          onChange={(e) => handleSlideContentChange(carouselActiveIndex, 'headline', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary uppercase mb-1">
                          Slide {carouselActiveIndex + 1} Support Text
                        </label>
                        <textarea 
                          value={formInputs.carouselSlides[carouselActiveIndex]?.support || ''} 
                          onChange={(e) => handleSlideContentChange(carouselActiveIndex, 'support', e.target.value)}
                          rows={2} 
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary transition resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* REUSABLE META CONFIGURATIONS */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">EMOTION CORE</label>
                    <select 
                      value={formInputs.emotion} 
                      onChange={(e) => setFormInputs(prev => ({ ...prev, emotion: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                    >
                      <option value="stress">Stress & Pressure</option>
                      <option value="anxiety">Anxiety / Overwhelm</option>
                      <option value="hope">Hope & Clarity</option>
                      <option value="relief">Relief & Solution</option>
                      <option value="ambition">Ambition & Growth</option>
                      <option value="confusion">Confusion / Chaos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">CAMPAIGN CONTEXT</label>
                    <select 
                      value={formInputs.context} 
                      onChange={(e) => setFormInputs(prev => ({ ...prev, context: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                    >
                      <option value="financial wellbeing">Financial Wellbeing</option>
                      <option value="salary access">Salary Access (Earned Wage)</option>
                      <option value="workplace wellness">Workplace Wellness</option>
                      <option value="employee benefit">Employee Benefit</option>
                      <option value="productivity">Workplace Productivity</option>
                      <option value="career growth">Career Growth</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">HERO SCENARIO MODE</label>
                    <select 
                      value={formInputs.heroMode} 
                      onChange={(e) => setFormInputs(prev => ({ ...prev, heroMode: e.target.value as any }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                    >
                      <option value="SMARTPHONE">Smartphone (Fintech Alert / App UI)</option>
                      <option value="WORKSPACE">Workspace (Laptop / Office Setup)</option>
                      <option value="HUMAN">Human Interaction (Collaborative Team)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">TYPOGRAPHY STYLE</label>
                    <select 
                      value={formInputs.typography} 
                      onChange={(e) => setFormInputs(prev => ({ ...prev, typography: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                    >
                      <option value="bold fintech">Bold Modern Fintech</option>
                      <option value="premium editorial">Premium Editorial</option>
                      <option value="emotional bold">Emotional High Contrast</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* GEMINI LIVE PROMPT CENTER */}
              <div className="bg-gradient-to-b from-brand-dark/20 to-brand-obsidian/45 dark:from-brand-dark/30 dark:to-brand-obsidian/90 p-5 rounded-3xl border border-brand-primary/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between border-b border-brand-primary/20 pb-3 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse"></span>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-brand-primary">Gemini Live Prompt Center</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={openTemplateEditor} 
                      className="text-[10px] text-brand-primary hover:underline flex items-center gap-1 bg-brand-primary/5 px-2 py-1 rounded border border-brand-primary/20 animate-pulse" 
                      title="Edit Master System Prompt Template"
                    >
                      <FileText className="w-3 h-3" />
                      Edit Base Template
                    </button>
                    <div className="flex bg-brand-obsidian/60 p-0.5 rounded-lg border border-brand-primary/10">
                      <button 
                        onClick={() => setPromptTab('master')} 
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
                          promptTab === 'master' 
                            ? 'bg-brand-primary text-brand-obsidian' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Master Prompt
                      </button>
                      <button 
                        onClick={() => setPromptTab('imagen')} 
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
                          promptTab === 'imagen' 
                            ? 'bg-brand-primary text-brand-obsidian' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Image Prompt
                      </button>
                    </div>
                  </div>
                </div>

                {/* ENLARGED INTERACTIVE TERMINAL FIELD (380px High) */}
                <div className="relative mb-4">
                  <textarea 
                    value={compiledPrompt} 
                    onChange={(e) => setCompiledPrompt(e.target.value)}
                    className="w-full h-[380px] bg-brand-obsidian/90 border border-brand-primary/20 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 dark:text-brand-primary/90 focus:outline-none focus:border-brand-primary/60 resize-none overflow-y-auto"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="text-[9px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded font-mono">Dynamic Compile Ready</span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={copyToClipboard} 
                    className="w-full bg-brand-primary text-brand-obsidian font-bold text-xs py-3 px-4 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition duration-150 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Selected Prompt
                  </button>
                  <button 
                    onClick={saveToHistory} 
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 px-4 rounded-xl border border-white/20 transition duration-150 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save to History
                  </button>
                </div>
              </div>

              {/* RIWAYAT PENYIMPANAN */}
              <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-brand-dark/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-dark/10 pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-brand-primary">Prompt History Logs</h2>
                  <button onClick={() => setShowConfirmClear(true)} className="text-[10px] text-red-400 hover:underline">Clear All</button>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {historyLogs.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 dark:text-gray-500 text-xs font-medium">
                      No saved prompt logs found. Click "Save to History" above to log a template.
                    </div>
                  ) : (
                    historyLogs.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-slate-50 dark:bg-brand-obsidian/60 p-3 rounded-xl border border-slate-200/50 dark:border-brand-dark/25 space-y-2 relative group hover:border-brand-primary/40 transition duration-150"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 max-w-[80%]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                item.mode === 'carousel' ? 'bg-blue-500/10 text-blue-400' : 'bg-brand-primary/10 text-brand-primary'
                              }`}>
                                {item.mode.toUpperCase()}
                              </span>
                              <span className="text-[8px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                {item.emotion}
                              </span>
                              <span className="text-[8px] text-slate-400 font-mono">{item.timestamp}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-2" title={item.headline}>
                              {item.headline}
                            </h4>
                          </div>
                          <button 
                            onClick={() => deleteHistoryItem(item.id)} 
                            className="text-red-400 hover:text-red-500 text-xs" 
                            title="Delete Log"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => copyHistoryPrompt(item.promptText)} 
                            className="flex-1 text-[9px] font-bold py-1 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded transition"
                          >
                            Copy Prompt
                          </button>
                          <button 
                            onClick={() => restoreHistoryState(item)} 
                            className="flex-1 text-[9px] font-bold py-1 bg-white/5 hover:bg-white/10 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded transition"
                          >
                            Restore State
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DESIGN & BRANDING CONTROLS */}
          {sidebarTab === 'design' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* TYPOGRAPHY POSITION & SCALING CONTROLS */}
              <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-brand-dark/20 shadow-sm space-y-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-brand-primary">Interactive Layout Adjustments</h2>
                
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">
                    <span>Headline Font Size</span>
                    <span>{designSettings.headlineSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="24" 
                    max="52" 
                    value={designSettings.headlineSize} 
                    onChange={(e) => setDesignSettings(prev => ({ ...prev, headlineSize: parseInt(e.target.value) }))}
                    className="w-full accent-brand-primary" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">
                    <span>Support Font Size</span>
                    <span>{designSettings.supportSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="22" 
                    value={designSettings.supportSize} 
                    onChange={(e) => setDesignSettings(prev => ({ ...prev, supportSize: parseInt(e.target.value) }))}
                    className="w-full accent-brand-primary" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">
                    <span>Backdrop Panel Position Y</span>
                    <span>{designSettings.layoutY}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="90" 
                    value={designSettings.layoutY} 
                    onChange={(e) => setDesignSettings(prev => ({ ...prev, layoutY: parseInt(e.target.value) }))}
                    className="w-full accent-brand-primary" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">
                    <span>Backdrop Blur Intensity</span>
                    <span>{designSettings.blurIntensity}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="30" 
                    value={designSettings.blurIntensity} 
                    onChange={(e) => setDesignSettings(prev => ({ ...prev, blurIntensity: parseInt(e.target.value) }))}
                    className="w-full accent-brand-primary" 
                  />
                </div>
              </div>

              {/* BRAND PLACEMENT CONTROLS */}
              <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-brand-dark/20 shadow-sm space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-brand-primary">Branding Options</h2>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">ARUS.ID LOGO ALIGNMENT</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button 
                        key={align}
                        onClick={() => setDesignSettings(prev => ({ ...prev, logoAlign: align as any }))}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition ${
                          designSettings.logoAlign === align
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {align} Aligned
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">MOCKUP PHOTO DIRECTION</label>
                  <select 
                    value={designSettings.mockupPhoto} 
                    onChange={(e) => setDesignSettings(prev => ({ ...prev, mockupPhoto: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                  >
                    <option value="corporate-stress">Moody Corporate Distraction (Dark)</option>
                    <option value="modern-office">High-End Collaborative Workplace (Bright)</option>
                    <option value="jakarta-commuter">Jakarta Professional Transit (Transit)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

        </section>

        {/* RIGHT MAIN CONTENT: INTERACTIVE LIVE POSTER / CAROUSEL VISUAL CANVAS */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          <div className="bg-white dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-200/50 dark:border-brand-dark/30 shadow-xl space-y-4">
            
            {/* MOCKUP CANVAS WRAPPER (FOR 3:4 PORTRAIT MOCKUPS) */}
            <div 
              id="visualMockupViewport"
              className="relative w-full max-w-[430px] mx-auto aspect-[3/4] bg-brand-dark/50 rounded-2xl overflow-hidden shadow-2xl border border-brand-dark/40"
            >
              
              {/* REAL PHOTO BACKGROUND WRAPPER */}
              <div 
                style={{ backgroundImage: `url(${PHOTO_REPO[designSettings.mockupPhoto]})` }}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-700 scale-100 ${
                  isSlideDarkTheme ? 'brightness-75' : 'brightness-[0.95] contrast-[1.02]'
                }`}
              />
              
              {/* AMBIENT REACTIVE GRADIENT TINT */}
              <div 
                className={`absolute inset-0 transition-all duration-500 ${
                  isSlideDarkTheme 
                    ? 'bg-gradient-to-t from-brand-dark/95 via-brand-dark/50 to-transparent mix-blend-multiply opacity-90' 
                    : 'bg-gradient-to-t from-white/90 via-white/40 to-transparent mix-blend-overlay opacity-80'
                }`}
              />
              
              {/* CAROUSEL SPECIFIC PAGINATION INDICATOR */}
              {engineMode === 'carousel' && (
                <div className="absolute top-4 right-4 bg-brand-obsidian/75 backdrop-blur-md border border-brand-primary/20 text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-full z-20">
                  SLIDE {carouselActiveIndex + 1} OF 5
                </div>
              )}

              {/* FLOATING PREVIEW GLASSMORPHIC BRANDED UI (TOP LEFT) */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-brand-obsidian/75 backdrop-blur-md border border-brand-primary/20 rounded-full pl-2 pr-3 py-1 scale-95 origin-top-left">
                <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-brand-obsidian" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M2 17l6-6 4 4 10-10" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-white tracking-wider">Arus.id</span>
              </div>

              {/* FLOATING FINTECH GLASS INTERFACE CARDS */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Card 1: Smartphone Salary Alert Box */}
                <div 
                  className={`absolute bottom-1/3 left-6 right-6 p-4 rounded-2xl shadow-2xl transition-all duration-500 max-w-[260px] animate-pulse ${
                    showSmartphoneAlert ? 'opacity-100 scale-95' : 'opacity-0 scale-80'
                  } ${
                    isSlideDarkTheme 
                      ? 'bg-brand-obsidian/45 border-white/20' 
                      : 'bg-brand-dark/10 border-brand-primary/40'
                  } backdrop-blur-md border`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary"></div>
                    <span className="text-[9px] text-brand-primary font-bold tracking-wider">SALARY CREDIT NOTIFICATION</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Rp 8,500,000 Transferred</h4>
                  <p className="text-[8px] text-gray-300">Earned salary accessed early via Arus.id</p>
                </div>
              </div>

              {/* DESIGN ADJUSTABLE CONTENT PLACEMENT BOX */}
              <div 
                style={{ 
                  top: `${designSettings.layoutY}%`, 
                  backdropFilter: `blur(${designSettings.blurIntensity}px)`,
                  WebkitBackdropFilter: `blur(${designSettings.blurIntensity}px)`
                }}
                className="absolute left-4 right-4 p-5 rounded-2xl bg-brand-obsidian/65 border border-brand-primary/20 shadow-2xl z-20 transition-all duration-300 flex flex-col justify-between"
              >
                
                <div>
                  {/* SUB-BRAND ARUS MINI IDENTIFIER */}
                  <div className={`flex items-center gap-1.5 mb-2 ${
                    designSettings.logoAlign === 'center' ? 'justify-center' : designSettings.logoAlign === 'right' ? 'justify-end' : 'justify-start'
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                    <span className="text-[8px] font-bold tracking-widest text-slate-300 uppercase">A R U S . I D  C A M P A I G N</span>
                  </div>

                  {/* PREVIEW MAIN HEADLINE */}
                  <h3 
                    style={{ fontSize: `${designSettings.headlineSize}px` }}
                    className="font-roboto font-black text-white leading-snug tracking-tight mb-2 uppercase break-words transition-all duration-200"
                  >
                    {renderHeadlineWithHighlights(activeHeadline, activeHighlight)}
                  </h3>

                  {/* PREVIEW SUPPORT TEXT */}
                  <p 
                    style={{ fontSize: `${designSettings.supportSize}px` }}
                    className="text-gray-300 font-medium leading-relaxed mb-4 transition-all duration-200"
                  >
                    {activeSupport}
                  </p>
                </div>

                {/* CTA BUTTON & FOOTER */}
                <div className="flex items-center justify-between border-t border-brand-primary/10 pt-3">
                  <span className="text-[9px] bg-brand-primary text-brand-obsidian font-extrabold px-3 py-1.5 rounded-lg tracking-wider uppercase shadow-md">
                    {activeCta}
                  </span>
                  <span className="text-[8px] font-semibold text-slate-400">FINTECH PLATFORM</span>
                </div>
              </div>

              {/* PERSISTENT FOOTER FOR CAROUSEL SLIDER CONTROLS */}
              {engineMode === 'carousel' && (
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-30">
                  <button 
                    disabled={carouselActiveIndex === 0}
                    onClick={() => setCarouselActiveIndex(prev => Math.max(0, prev - 1))} 
                    className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-700/50 hover:bg-slate-800 flex items-center justify-center text-white text-xs disabled:opacity-40 transition-colors"
                  >
                    ◀
                  </button>
                  <div className="flex gap-1.5 items-center bg-brand-obsidian/70 px-3 py-2 rounded-full border border-brand-primary/10">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <span 
                        key={idx}
                        className={`rounded-full transition-all duration-300 ${
                          carouselActiveIndex === idx 
                            ? 'w-4 h-2 bg-brand-primary' 
                            : 'w-2 h-2 bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <button 
                    disabled={carouselActiveIndex === 4}
                    onClick={() => setCarouselActiveIndex(prev => Math.min(4, prev + 1))} 
                    className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-700/50 hover:bg-slate-800 flex items-center justify-center text-white text-xs disabled:opacity-40 transition-colors"
                  >
                    ▶
                  </button>
                </div>
              )}

            </div>

            {/* DOWNLOAD & EXPORT TRIGGER */}
            <div className="flex gap-3 justify-center max-w-[430px] mx-auto">
              <button 
                onClick={renderHighResPosterExport} 
                className="flex-1 bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/50 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition hover:bg-slate-800"
              >
                <Download className="w-4 h-4 text-brand-primary" />
                Download Current Slide (1200x1600 px)
              </button>
            </div>

          </div>

        </section>

      </main>

      {/* CONFIRMATION CLEAR HISTORY MODAL */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-brand-obsidian/75 backdrop-blur-md z-[100] flex items-center justify-center animate-fade-in">
          <div className="bg-slate-900 border border-brand-primary/20 max-w-sm w-full mx-4 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Clear All History Logs?</h3>
              <p className="text-xs text-gray-400 mt-1">This action will delete all saved prompt history in your local browser storage. This cannot be undone.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setShowConfirmClear(false)} 
                className="bg-white/10 text-white font-semibold text-xs py-3 rounded-xl hover:bg-white/15 transition"
              >
                Cancel
              </button>
              <button 
                onClick={clearAllHistory} 
                className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs py-3 rounded-xl transition"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE EDITOR MODAL */}
      {showTemplateEditor && (
        <div className="fixed inset-0 bg-brand-obsidian/85 backdrop-blur-md z-[100] flex items-center justify-center animate-fade-in">
          <div className="bg-slate-950 border border-brand-primary/30 max-w-3xl w-full mx-4 rounded-3xl p-6 shadow-2xl space-y-4 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-brand-primary/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                <h3 className="font-bold text-white text-base">Custom Master Template Editor</h3>
              </div>
              <button onClick={() => setShowTemplateEditor(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-brand-obsidian/40 p-3 rounded-xl border border-brand-primary/10">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Template To Edit</label>
                <select 
                  value={editingTemplateMode} 
                  onChange={(e) => {
                    const newMode = e.target.value as any;
                    setEditingTemplateMode(newMode);
                    setTempTemplateText(newMode === 'poster' ? customPosterTemplate : customCarouselTemplate);
                  }}
                  className="w-full bg-slate-900 border border-brand-primary/20 rounded-lg px-3 py-1.5 text-xs text-brand-primary focus:outline-none"
                >
                  <option value="poster">Single Poster Master Prompt</option>
                  <option value="carousel">5-Slide Carousel Master Prompt</option>
                </select>
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed">
                <span className="text-brand-primary font-semibold">Pro-Tip:</span> Pastikan kamu tetap menyertakan tag placeholder agar sinkronisasi real-time tetap berfungsi.
              </div>
            </div>

            <div className="flex-1 min-h-[250px] flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Raw Prompt Framework Layout</label>
              <textarea 
                value={tempTemplateText}
                onChange={(e) => setTempTemplateText(e.target.value)}
                className="flex-1 w-full bg-brand-obsidian/90 border border-brand-primary/20 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-slate-200 focus:outline-none focus:border-brand-primary/60 resize-none overflow-y-auto"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-2 border-t border-brand-primary/10">
              <button 
                onClick={resetTemplateToDefault} 
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition flex items-center gap-1.5 self-start sm:self-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Selected to Default
              </button>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setShowTemplateEditor(false)} 
                  className="flex-1 sm:flex-none bg-white/10 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-white/15 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveCustomTemplate} 
                  className="flex-1 sm:flex-none bg-brand-primary text-brand-obsidian font-bold text-xs px-6 py-2.5 rounded-xl hover:opacity-90 transition"
                >
                  Save Custom Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div 
        className={`fixed bottom-6 right-6 bg-slate-900 border border-brand-primary/30 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 z-[100] ${
          toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></div>
        <p className="text-xs text-white font-medium">{toastMessage}</p>
      </div>
    </div>
  );
}

export default App;
