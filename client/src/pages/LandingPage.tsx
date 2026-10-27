import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Play,
  CheckCircle2,
  Cpu,
  Clock,
  BarChart3,
  Terminal,
  Sparkles,
  ShieldCheck,
  Code2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python'>('javascript');
  const [isRunningSample, setIsRunningSample] = useState(false);
  const [sampleOutput, setSampleOutput] = useState<string | null>(null);

  // Active skill in peach card
  const [activeSkillIdx, setActiveSkillIdx] = useState(3); // Generative AI is index 3

  const skillsList = [
    { name: 'Business analysis', desc: 'Requirements decomp, system constraints, user pain point mapping, and API contract scoping.' },
    { name: '0->1 product design', desc: 'Rapid prototyping, wireframing, architecture discovery, and end-to-end user journey validation.' },
    { name: 'Design engineering', desc: 'Design systems, micro-interactions, responsive CSS architecture, and high-fidelity code handoffs.' },
    { name: 'Generative AI', desc: 'Chatbots, co-pilots, dialogue flows. I design AI products and work with AI tools across my entire process.' },
    { name: 'MVP scoping', desc: 'Feature triage, engineering effort balancing, risk reduction, and lightning-fast milestone delivery.' },
    { name: 'Product strategy', desc: 'Metrics definition, retention loop design, competitive analysis, and product-market fit iteration.' },
    { name: 'QA ownership', desc: 'Edge case mapping, automated test coverage, regression validation, and release readiness audits.' },
  ];

  // Testimonials carousel
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const testimonials = [
    {
      name: 'Mikhail Dubov',
      role: 'Founder @ Chattermill',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      quote:
        '“Gregory is the perfect Founding Designer, with meticulous attention to details, full design ownership end to end from idea generation to user research to of course implementation and even quality control.\n\nYou would be hard pressed to find someone else who cares about the product they are working as much.\n\nNot to mention one of the best work ethics I\'ve seen and huge experience building B2B products.”',
    },
    {
      name: 'Alex Rivera',
      role: 'Senior Staff Engineer @ Stripe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      quote:
        '“InterviewLab is the perfect technical interview practice suite. Meticulous attention to details, server-authoritative time boundaries, and full fidelity from code editor to hidden test evaluation.\n\nYou would be hard pressed to find another platform with this level of engineering rigor.”',
    },
    {
      name: 'Elena Rostova',
      role: 'Tech Lead @ Vercel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      quote:
        '“The Monaco IDE integration is flawless. Auto-saving drafts, immediate runtime metrics, and memory analysis make it feel like an authentic developer workstation rather than a clunky quiz.”',
    },
  ];

  const handleSimulateRun = () => {
    setIsRunningSample(true);
    setSampleOutput(null);
    setTimeout(() => {
      setIsRunningSample(false);
      setSampleOutput('Passed 6/6 test cases. Max Subarray Sum = 6. Memory: 3.2MB • Time: 34ms');
    }, 550);
  };

  const nextTestimonial = () => {
    setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[testimonialIdx];

  const topicsList = [
    { name: 'Arrays & Hashing', count: '2 Problems', tag: 'Linear Time' },
    { name: 'Two Pointers', count: '2 Problems', tag: 'Sorted Arrays' },
    { name: 'Sliding Window', count: '2 Problems', tag: 'Subarrays' },
    { name: 'Stack & Monotonic', count: '2 Problems', tag: 'Next Greater' },
    { name: 'Binary Search', count: '2 Problems', tag: 'Logarithmic' },
    { name: 'Linked Lists', count: '2 Problems', tag: 'Pointers' },
    { name: 'Trees & DFS/BFS', count: '2 Problems', tag: 'Hierarchical' },
    { name: 'Backtracking', count: '2 Problems', tag: 'State Space' },
    { name: 'Dynamic Programming', count: '2 Problems', tag: 'Optimal Substructure' },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 pt-4 pb-20 space-y-16 selection:bg-[#2D80FD]/20 selection:text-[#181212]">
      {/* =========================================================================
          FEATURED CARDS ROW (Exact replica of murynmukha.com top section)
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-stretch pt-2">
        {/* LEFT CARD: Pastel Coral/Peach with Tilted Skill Wheel & Pink Pill Card */}
        <div className="sp-card sp-card-peach min-h-[400px] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Tilted Competency Wheel with 3D fade mask */}
          <div className="flex flex-col gap-2.5 text-left py-6 select-none transform -rotate-[12deg] origin-center shrink-0 cylinder-mask">
            {skillsList.map((skill, idx) => {
              const isActive = idx === activeSkillIdx;
              const isDistance1 = Math.abs(idx - activeSkillIdx) === 1;
              const isDistance2 = Math.abs(idx - activeSkillIdx) === 2;

              let styleClasses = 'text-xs text-[#837D7D]/40 blur-[0.6px]';
              if (isActive) {
                styleClasses = 'text-[17px] font-bold text-[#181212] py-1 flex items-center gap-2';
              } else if (isDistance1) {
                styleClasses = 'text-sm font-medium text-[#837D7D]/80 hover:text-[#181212] cursor-pointer transition';
              } else if (isDistance2) {
                styleClasses = 'text-xs font-medium text-[#837D7D]/60 blur-[0.3px] hover:text-[#181212] cursor-pointer transition';
              }

              return (
                <div
                  key={skill.name}
                  onClick={() => setActiveSkillIdx(idx)}
                  className={`transition-all duration-200 ${styleClasses}`}
                >
                  {isActive && <span className="text-[#181212] font-black text-lg">&rarr;</span>}
                  <span>{skill.name}</span>
                </div>
              );
            })}
          </div>

          {/* Right Floating Pastel Pink Pill Card */}
          <div className="bg-[#FFE5E8] rounded-[36px] p-7 sm:max-w-[275px] shadow-xs border border-pink-200/50 text-left my-auto shrink-0 animate-in fade-in duration-300">
            <p className="text-[15px] font-normal text-[#211B1C] leading-[1.6]">
              {skillsList[activeSkillIdx].desc}
            </p>
          </div>
        </div>

        {/* RIGHT CARD: Pastel Ice Blue with Author Avatar, Controls & Testimonial */}
        <div className="sp-card sp-card-blue min-h-[400px] p-8 sm:p-10 flex flex-col justify-between text-left relative">
          {/* Header Row: Avatar, Author & Navigation Arrows */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={currentTestimonial.avatar}
                alt={currentTestimonial.name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-white shadow-xs"
              />
              <div>
                <h4 className="font-semibold text-lg text-[#181212] leading-tight">
                  {currentTestimonial.name}
                </h4>
                <p className="text-[13px] font-medium text-[#837D7D] mt-0.5">
                  {currentTestimonial.role}
                </p>
              </div>
            </div>

            {/* Circular Carousel Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#2D80FD] border border-[#D5E5FC] flex items-center justify-center transition shadow-xs active:scale-95"
                aria-label="Previous Testimonial"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#2D80FD] border border-[#D5E5FC] flex items-center justify-center transition shadow-xs active:scale-95"
                aria-label="Next Testimonial"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="my-auto py-5">
            <p className="text-[14.5px] sm:text-[15.5px] font-normal text-[#211B1C] leading-[1.65] whitespace-pre-line">
              {currentTestimonial.quote}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUNDING DESIGNER AT STARTUPS BACKED BY (Exact murynmukha divider)
         ========================================================================= */}
      <section className="pt-4 pb-2">
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="h-[1px] bg-[#EAEAEA] flex-1 max-w-[220px]" />
          <span className="text-[13px] font-normal text-[#837D7D] whitespace-nowrap">
            Founding designer at startups backed by
          </span>
          <div className="h-[1px] bg-[#EAEAEA] flex-1 max-w-[220px]" />
        </div>

        {/* Authentic Logos */}
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 text-sm sm:text-base font-bold text-[#181212]">
          {/* Y Combinator Logo */}
          <div className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight">
            <span className="w-6 h-6 bg-[#181212] text-white flex items-center justify-center rounded font-black text-xs">
              Y
            </span>
            <span>Combinator</span>
          </div>

          {/* SEQUOIA Logo */}
          <div className="flex items-center gap-1.5 text-lg sm:text-xl font-extrabold tracking-[0.2em] font-serif uppercase">
            <span>SEQUOIA</span>
            <span className="text-emerald-700 text-sm font-sans">🌲</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CASE STUDY 1: Twain / Problem Library & Live Sandbox
         ========================================================================= */}
      <section className="space-y-6 text-left pt-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-1">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181212]">
              Twain
            </h2>
            <p className="text-sm text-[#837D7D] mt-1 font-normal">
              Building GTM agents for research & outreach &nbsp;·&nbsp; '22 – Present
            </p>
          </div>
          <Link to="/questions" className="btn-muryn-blue shrink-0">
            <span>Explore Live</span>
            <span className="text-base font-bold">&rarr;</span>
          </Link>
        </div>

        {/* Embedded Interactive Code Workspace Card */}
        <div className="sp-card sp-card-white border border-[#EAEAEA] rounded-[36px] overflow-hidden">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-[#EAEAEA] bg-[#FAF8F8] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#E0465C]" />
                <div className="w-3 h-3 rounded-full bg-[#FFDB08]" />
                <div className="w-3 h-3 rounded-full bg-[#1BE349]" />
              </div>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#EAEAEA] text-xs font-mono font-medium">
                <button
                  onClick={() => setSelectedLanguage('javascript')}
                  className={`px-3 py-1 rounded transition ${
                    selectedLanguage === 'javascript'
                      ? 'bg-[#2D80FD] text-white font-bold'
                      : 'text-[#837D7D] hover:text-[#181212]'
                  }`}
                >
                  solution.js
                </button>
                <button
                  onClick={() => setSelectedLanguage('python')}
                  className={`px-3 py-1 rounded transition ${
                    selectedLanguage === 'python'
                      ? 'bg-[#2D80FD] text-white font-bold'
                      : 'text-[#837D7D] hover:text-[#181212]'
                  }`}
                >
                  solution.py
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                EASY
              </span>
              <span className="text-xs text-[#837D7D] font-mono hidden sm:inline">
                Subarray Maximum Profit
              </span>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-6 bg-[#FCFBFB] font-mono text-xs text-[#211B1C] leading-relaxed overflow-x-auto">
            {selectedLanguage === 'javascript' ? (
              <pre>
                <span className="text-[#837D7D]">// Kadane&apos;s Linear Algorithm O(N)</span>{'\n'}
                <span className="text-[#2D80FD] font-bold">function</span> <span className="text-[#E0465C] font-bold">maxSubarraySum</span>(nums) &#123;{'\n'}
                {'  '}<span className="text-[#2D80FD]">let</span> currentSum = nums[0];{'\n'}
                {'  '}<span className="text-[#2D80FD]">let</span> maxSum = nums[0];{'\n'}
                {'  '}<span className="text-[#2D80FD]">for</span> (<span className="text-[#2D80FD]">let</span> i = 1; i &lt; nums.length; i++) &#123;{'\n'}
                {'    '}currentSum = Math.max(nums[i], currentSum + nums[i]);{'\n'}
                {'    '}maxSum = Math.max(maxSum, currentSum);{'\n'}
                {'  '}&#125;{'\n'}
                {'  '}<span className="text-[#2D80FD]">return</span> maxSum;{'\n'}
                &#125;
              </pre>
            ) : (
              <pre>
                <span className="text-[#837D7D]"># Kadane&apos;s Linear Algorithm O(N)</span>{'\n'}
                <span className="text-[#2D80FD] font-bold">def</span> <span className="text-[#E0465C] font-bold">maxSubarraySum</span>(nums: list[int]) -&gt; int:{'\n'}
                {'    '}current_sum = nums[0]{'\n'}
                {'    '}max_sum = nums[0]{'\n'}
                {'    '}<span className="text-[#2D80FD]">for</span> x <span className="text-[#2D80FD]">in</span> nums[1:]:{'\n'}
                {'        '}current_sum = max(x, current_sum + x){'\n'}
                {'        '}max_sum = max(max_sum, current_sum){'\n'}
                {'    '}<span className="text-[#2D80FD]">return</span> max_sum
              </pre>
            )}
          </div>

          {/* Footer Bar with Simulation Run */}
          <div className="p-4 px-6 border-t border-[#EAEAEA] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#837D7D] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#1BE349]" />
              <span>{sampleOutput || 'Sample test cases ready. Click Run to evaluate.'}</span>
            </div>

            <button
              onClick={handleSimulateRun}
              disabled={isRunningSample}
              className="px-5 py-2 rounded-full bg-[#181212] text-white font-semibold hover:bg-[#2D80FD] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunningSample ? 'Evaluating Runner...' : 'Run In Browser'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CASE STUDY 2: Server-Authoritative Mocks
         ========================================================================= */}
      <section className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-1">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181212]">
              Server-Authoritative Mocks
            </h2>
            <p className="text-sm text-[#837D7D] mt-1 font-normal">
              Countdown enforcement with deterministic speed bonuses &nbsp;·&nbsp; 15 to 60 Mins
            </p>
          </div>
          <Link to="/interview/setup" className="btn-muryn-blue shrink-0">
            <span>Setup Interview</span>
            <span className="text-base font-bold">&rarr;</span>
          </Link>
        </div>

        {/* Feature Preview Card */}
        <div className="sp-card sp-card-white p-8 rounded-[36px] border border-[#EAEAEA] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[28px] bg-[#FAF8F8] border border-[#EAEAEA] space-y-2">
            <span className="font-mono text-xs font-bold text-[#2D80FD] uppercase">01 // Strict Clocks</span>
            <h4 className="text-lg font-semibold text-[#181212]">Server Countdown</h4>
            <p className="text-xs text-[#837D7D] leading-relaxed">
              Timers are tracked server-side in PostgreSQL. Submissions past expiration are rejected automatically to prevent client-side clock tampering.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-[#FAF8F8] border border-[#EAEAEA] space-y-2">
            <span className="font-mono text-xs font-bold text-[#E0465C] uppercase">02 // Formula Scoring</span>
            <h4 className="text-lg font-semibold text-[#181212]">Deterministic Formula</h4>
            <p className="text-xs text-[#837D7D] leading-relaxed">
              Score = Base Correctness (75 pts) + Time Bonus (15 pts) + First-Pass Bonus (10 pts) minus submission penalty deductions.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-[#FAF8F8] border border-[#EAEAEA] space-y-2">
            <span className="font-mono text-xs font-bold text-emerald-600 uppercase">03 // Instant Debrief</span>
            <h4 className="text-lg font-semibold text-[#181212]">Actionable Evaluation</h4>
            <p className="text-xs text-[#837D7D] leading-relaxed">
              Receive comprehensive breakdown of test case coverage, algorithmic complexity, runtime efficiency, and targeted study areas.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CURRICULUM BREAKDOWN: 9 Foundational Topics
         ========================================================================= */}
      <section className="space-y-6 text-left">
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181212]">
            Curriculum & Foundational Topics
          </h2>
          <p className="text-sm text-[#837D7D] mt-1 font-normal">
            Carefully curated problem taxonomy covering essential technical interview patterns
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {topicsList.map((t, idx) => (
            <Link
              key={t.name}
              to={`/questions?topic=${encodeURIComponent(t.name)}`}
              className="p-5 rounded-[24px] border border-[#EAEAEA] bg-white hover:border-[#2D80FD] hover:shadow-xs transition flex items-center justify-between group"
            >
              <div>
                <div className="text-[11px] font-mono text-[#837D7D]">
                  0{idx + 1} // {t.tag}
                </div>
                <h4 className="text-sm font-semibold text-[#181212] group-hover:text-[#2D80FD] transition mt-1">
                  {t.name}
                </h4>
              </div>
              <span className="text-xs font-mono font-medium text-[#837D7D]">
                {t.count}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
